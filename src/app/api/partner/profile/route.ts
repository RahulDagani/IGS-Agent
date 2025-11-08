import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    // Get user with agent meta
    const userData = await prisma.apply_tenant_users.findUnique({
      where: { 
        id: user.userId,
        email: user.email 
      },
      include: {
        agent_meta: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!userData.agent_meta) {
      // Return empty profile if no agent meta exists
      const emptyProfile = {
        // Personal Tab
        fullName: userData.name || "",
        phoneNumber: userData.phone_number || "",
        existingAgencyLogo: "",
        
        // Business Tab
        businessName: "",
        country: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        existingBusinessCertificate: "",
        
        // Contact Tab
        whatsapp: "",
        website: "",
        facebook: "",
        linkedin: "",
        instagram: "",
        twitter: "",
        otherSocial: "",
        
        // Payment Tab
        ifscCode: "",
        bankAccountNumber: "",
        accountHolderName: "",
        existingPanCard: "",
      };

      return NextResponse.json(emptyProfile);
    }

    // Transform data to match frontend format
    const agentData = {
      // Personal Tab
      fullName: userData.name || "",
      phoneNumber: userData.phone_number || "",
      existingAgencyLogo: userData.agent_meta.agency_logo || "",
      
      // Business Tab
      businessName: userData.agent_meta.business_name || "",
      country: userData.agent_meta.country || "",
      streetAddress: userData.agent_meta.street_address || "",
      city: userData.agent_meta.city || "",
      state: userData.agent_meta.state || "",
      postalCode: userData.agent_meta.postal_code || "",
      existingBusinessCertificate: userData.agent_meta.business_certificate || "",
      
      // Contact Tab
      whatsapp: userData.agent_meta.whatsapp_id || "",
      website: userData.agent_meta.website_url || "",
      facebook: userData.agent_meta.facebook || "",
      linkedin: userData.agent_meta.linkedin || "",
      instagram: userData.agent_meta.instagram || "",
      twitter: userData.agent_meta.twitter || "",
      otherSocial: userData.agent_meta.other || "",
      
      // Payment Tab
      ifscCode: userData.agent_meta.ifsc_code || "",
      bankAccountNumber: userData.agent_meta.bank_account_number || "",
      accountHolderName: userData.agent_meta.bank_account_name || "",
      existingPanCard: userData.agent_meta.pan_card_upload || "",
    };

    return NextResponse.json(agentData);
  } catch (error) {
    console.error("Error fetching agent profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Get user first to ensure they exist and get tenant_id
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

    // Prepare update data for user
    const userUpdateData: {
  name?: string;
  phone_number?: string;
} = {};
    
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    
    if (fullName) userUpdateData.name = fullName;
    if (phoneNumber) userUpdateData.phone_number = phoneNumber;

    // Prepare agent meta data - handle all fields properly
    const agentMetaUpdateData: {
  business_name?: string | null;
  country?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  whatsapp_id?: string | null;
  website_url?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  other?: string | null;
  ifsc_code?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
} = {};
    
    // Field mappings from form to database
    const fieldMappings: { [key: string]: string } = {
      'businessName': 'business_name',
      'streetAddress': 'street_address',
      'postalCode': 'postal_code',
      'whatsapp': 'whatsapp_id',
      'website': 'website_url',
      'otherSocial': 'other',
      'ifscCode': 'ifsc_code',
      'bankAccountNumber': 'bank_account_number',
      'accountHolderName': 'bank_account_name'
    };

    // Process all form fields
    const fields = [
      'businessName', 'country', 'streetAddress', 'city', 'state', 'postalCode',
      'whatsapp', 'website', 'facebook', 'linkedin', 'instagram', 'twitter', 
      'otherSocial', 'ifscCode', 'bankAccountNumber', 'accountHolderName'
    ];

    fields.forEach(field => {
  const value = formData.get(field) as string;
  const dbFieldName = (fieldMappings[field] || field) as keyof typeof agentMetaUpdateData;
  
  // For required fields, set default values if empty
  if (field === 'businessName' || field === 'country') {
    // These are required fields in your schema
    agentMetaUpdateData[dbFieldName] = value && value.trim() !== '' ? value : '';
  } else {
    // Optional fields - set to null if empty
    agentMetaUpdateData[dbFieldName] = value && value.trim() !== '' ? value : null;
  }
});

    // Update user data if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.apply_tenant_users.update({
        where: { id: userData.id },
        data: userUpdateData
      });
    }

    // Check if agent_meta already exists
    const existingAgentMeta = await prisma.apply_agent_meta.findUnique({
      where: { user_id: userData.id }
    });

    if (existingAgentMeta) {
      // Update existing agent_meta - only update provided fields
      const updateData: Partial<typeof agentMetaUpdateData> = {};
      
      // Only include fields that were actually provided in the form
      Object.keys(agentMetaUpdateData).forEach((key) => {
  const fieldKey = key as keyof typeof agentMetaUpdateData;
  const formValue = formData.get(
    Object.keys(fieldMappings).find(k => fieldMappings[k] === key) || key
  ) as string;
  
  if (formValue !== null) {
    updateData[fieldKey] = agentMetaUpdateData[fieldKey];
  }
});

     if (Object.keys(updateData).length > 0) {
  // Convert null values to Prisma's unset operation
  const prismaUpdateData: Record<string, unknown> = {};
  
  Object.keys(updateData).forEach(key => {
    const fieldKey = key as keyof typeof updateData;
    const value = updateData[fieldKey];
    
    if (value === null) {
      // Use Prisma's unset operation for null values
      prismaUpdateData[fieldKey] = { unset: true };
    } else {
      prismaUpdateData[fieldKey] = value;
    }
  });

  await prisma.apply_agent_meta.update({
    where: { user_id: userData.id },
    data: prismaUpdateData
  });
}
    } else {
      // Create new agent_meta - provide all required fields
      const createData = {
        // Required fields from your schema
        tenant_id: userData.tenant_id,
        user_id: userData.id,
        uuid: crypto.randomUUID(),
        business_name: agentMetaUpdateData.business_name || userData.name || 'Business Name',
        country: agentMetaUpdateData.country || 'United States', // Default country
        is_admin_verified: false, // Default value for required field
        
        // Optional fields from form data
        name: userData.name || null,
        street_address: agentMetaUpdateData.street_address || null,
        city: agentMetaUpdateData.city || null,
        state: agentMetaUpdateData.state || null,
        postal_code: agentMetaUpdateData.postal_code || null,
        website_url: agentMetaUpdateData.website_url || null,
        instagram: agentMetaUpdateData.instagram || null,
        facebook: agentMetaUpdateData.facebook || null,
        linkedin: agentMetaUpdateData.linkedin || null,
        twitter: agentMetaUpdateData.twitter || null,
        other: agentMetaUpdateData.other || null,
        whatsapp_id: agentMetaUpdateData.whatsapp_id || null,
        ifsc_code: agentMetaUpdateData.ifsc_code || null,
        bank_account_number: agentMetaUpdateData.bank_account_number || null,
        bank_account_name: agentMetaUpdateData.bank_account_name || null,
        
        // File fields - set to null initially
        agency_logo: null,
        business_certificate: null,
        pan_card_upload: null,
        skype_id: null, // Additional field from your schema
        is_payment_verified: false, // Default value
      };

      await prisma.apply_agent_meta.create({
        data: createData
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Error updating agent profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}