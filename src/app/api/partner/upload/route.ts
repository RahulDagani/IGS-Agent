import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT token
    const user = await AuthService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is agent
    if (user.type !== 'user' || (user.role !== 'agent' && !user.agentId)) {
      return NextResponse.json({ error: "Agent access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const field = formData.get('field') as string;

    if (!file || !field) {
      return NextResponse.json({ error: "File and field are required" }, { status: 400 });
    }

    // Validate file type and size
    const validFields = ['agencyLogo', 'businessCertificate', 'panCard'];
    if (!validFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large" }, { status: 400 });
    }

    const userData = await prisma.apply_tenant_users.findUnique({
      where: { 
        id: user.userId,
        email: user.email 
      },
      include: { agent_meta: true }
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads/agents');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${field}_${userData.id}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    await writeFile(filePath, buffer);

    // Update database with file path
    const fileUrl = `/uploads/agents/${fileName}`;
    
    let updateData = {};
    switch (field) {
      case 'agencyLogo':
        updateData = { agency_logo: fileUrl };
        break;
      case 'businessCertificate':
        updateData = { business_certificate: fileUrl };
        break;
      case 'panCard':
        updateData = { pan_card_upload: fileUrl };
        break;
    }

    await prisma.apply_agent_meta.upsert({
      where: { user_id: userData.id },
      update: updateData,
      create: {
        ...updateData,
        tenant_id: userData.tenant_id,
        user_id: userData.id,
        uuid: crypto.randomUUID(),
        business_name: userData.name || "",
        country: "",
      }
    });

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      message: "File uploaded successfully" 
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}