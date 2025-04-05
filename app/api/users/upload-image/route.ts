import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws-s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${userId}-${Date.now()}.${fileExtension}`;
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `profile-pictures/${uniqueFileName}`,
      Body: buffer,
      ContentType: file.type,
    });
    
    await s3Client.send(command);
    
    // Generate the URL where the file will be accessible
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-pictures/${uniqueFileName}`;
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: fileUrl 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 