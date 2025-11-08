// app/api/agent/account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('user_id') as string || '1';
    const tenantId = formData.get('tenant_id') as string || '1';
    
    // Get all current field values for this user
    const currentFieldValues = await prisma.apply_user_field_values.findMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
    });

    const updates = [];
    const creates = [];
    const fileUploads: Array<{
      fieldId: string;
      file: File;
      existingRecord: (typeof currentFieldValues)[0] | undefined; // You should replace 'any' with proper type if available
    }> = [];

    for (const [fieldId, value] of formData.entries()) {
      // Skip user_id and tenant_id fields
      if (fieldId === 'user_id' || fieldId === 'tenant_id') continue;

      const isFile = fieldId.startsWith('file_');
      const actualFieldId = isFile ? fieldId.replace('file_', '') : fieldId;
      
      // Fix: Add proper typing for the record parameter
      const existingRecord = currentFieldValues.find((record) => 
        record.field_id === actualFieldId
      );

      if (isFile) {
        const file = value as File;
        // For files, we'll handle them separately
        fileUploads.push({
          fieldId: actualFieldId,
          file,
          existingRecord,
        });
      } else {
        const fieldValue = value as string;
        
        if (existingRecord) {
          updates.push(
            prisma.apply_user_field_values.update({
              where: { id: existingRecord.id },
              data: {
                field_value: fieldValue,
                updated_at: new Date(),
              },
            })
          );
        } else {
          creates.push(
            prisma.apply_user_field_values.create({
              data: {
                user_id: userId,
                field_id: actualFieldId,
                field_value: fieldValue,
                tenant_id: tenantId,
              },
            })
          );
        }
      }
    }

    // Handle file uploads
    for (const { fieldId, file, existingRecord } of fileUploads) {
      const fileUrl = await uploadFile(file);
      
      if (existingRecord) {
        updates.push(
          prisma.apply_user_field_values.update({
            where: { id: existingRecord.id },
            data: {
              field_value: fileUrl,
              updated_at: new Date(),
            },
          })
        );
      } else {
        creates.push(
          prisma.apply_user_field_values.create({
            data: {
              user_id: userId,
              field_id: fieldId,
              field_value: fileUrl,
              tenant_id: tenantId,
            },
          })
        );
      }
    }

    // Execute all operations in a transaction
    await prisma.$transaction([
      ...updates,
      ...creates,
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      updated: updates.length,
      created: creates.length
    });
    
  } catch (error) {
    console.error('Error saving agent data:', error);
    return NextResponse.json(
      { error: 'Failed to save agent data' },
      { status: 500 }
    );
  }
}

// Mock file upload function
async function uploadFile(file: File): Promise<string> {
  // In a real application, you would:
  // 1. Upload to cloud storage (S3, Cloudinary, etc.)
  // 2. Get the file URL
  // 3. Return the URL
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, create a mock URL
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  return `/uploads/${timestamp}.${fileExtension}`;
}

export async function GET(request: NextRequest) {
  try {
    const userId = '1'; // Hardcoded for now
    const tenantId = '1'; // Hardcoded for now
    
    const fieldValues = await prisma.apply_user_field_values.findMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
      include: {
        field_definition: {
          include: {
            section: true,
          },
        },
      },
    });

    return NextResponse.json(fieldValues);
    
  } catch (error) {
    console.error('Error fetching agent data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent data' },
      { status: 500 }
    );
  }
}