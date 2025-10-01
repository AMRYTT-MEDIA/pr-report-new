import { NextResponse } from "next/server";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request) {
  try {
    const { avatarName } = await request.json();

    if (!avatarName) {
      return NextResponse.json({ error: "No avatar name provided." }, { status: 400 });
    }

    // Validate that the avatar exists in the meek directory
    const meekAvatarPath = path.join(process.cwd(), "public/meek", avatarName);
    if (!existsSync(meekAvatarPath)) {
      return NextResponse.json({ error: "Avatar not found in predefined avatars." }, { status: 404 });
    }

    // Create profile directory if it doesn't exist
    const avatarDir = path.join(process.cwd(), "public/uploads/profile");
    if (!existsSync(avatarDir)) {
      await mkdir(avatarDir, { recursive: true });
    }

    // Generate unique filename for the user's copy
    const timestamp = Date.now();
    const fileExtension = path.extname(avatarName);
    const baseName = path.basename(avatarName, fileExtension);
    const finalFilename = `${timestamp}-${baseName}${fileExtension}`;
    const userAvatarPath = path.join(avatarDir, finalFilename);

    // Copy the predefined avatar to user's profile directory
    await copyFile(meekAvatarPath, userAvatarPath);

    return NextResponse.json({
      message: "Avatar copied successfully",
      filename: finalFilename,
      path: `/uploads/profile/${finalFilename}`,
      success: true,
    });
  } catch (error) {
    console.error("Error copying avatar:", error);
    return NextResponse.json({ error: "Failed to copy avatar" }, { status: 500 });
  }
}
