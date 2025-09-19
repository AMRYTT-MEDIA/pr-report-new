import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo');
    const filename = formData.get('filename');
    const existingLogo = formData.get('existingLogo');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/svg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create website-logos directory if it doesn't exist
    const logoDir = path.join(os.tmpdir(), 'websites-logos');
    if (!existsSync(logoDir)) {
      await mkdir(logoDir, { recursive: true });
    }

    // Use provided filename or generate one
    const finalFilename = filename || `${Date.now()}-${file.name}`;
    const filePath = path.join(logoDir, finalFilename);

    // If updating existing logo, try to delete the old file first
    if (existingLogo) {
      try {
        // Extract filename from existing logo path
        const existingFilename = existingLogo.includes('/') 
          ? existingLogo.split('/').pop() 
          : existingLogo;
        
        const existingFilePath = path.join(logoDir, existingFilename);
        
        // Only delete if it's a different file than what we're uploading
        if (existingFilename !== finalFilename && existsSync(existingFilePath)) {
          await unlink(existingFilePath);
          console.log(`Deleted existing logo: ${existingFilename}`);
        }
      } catch (deleteError) {
        console.warn('Failed to delete existing logo:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Write the new file
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      message: existingLogo ? 'Logo replaced successfully' : 'Logo uploaded successfully',
      filename: finalFilename,
      path: `websites-logos/${finalFilename}`,
      success: true,
      replaced: !!existingLogo
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
  }
}
