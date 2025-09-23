import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("avatar");
    const filename = formData.get("filename");
    const existingAvatar = formData.get("existingAvatar");

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp",
      "image/svg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const avatarDir = path.join(process.cwd(), "public/uploads/profile");
    if (!existsSync(avatarDir)) {
      await mkdir(avatarDir, { recursive: true });
    }

    const safeOriginalName =
      file.name?.replace(/[^a-zA-Z0-9._-]/g, "_") || "avatar";
    const finalFilename = filename || `${Date.now()}-${safeOriginalName}`;
    const filePath = path.join(avatarDir, finalFilename);

    if (existingAvatar) {
      try {
        const existingFilename = existingAvatar.includes("/")
          ? existingAvatar.split("/").pop()
          : existingAvatar;
        const existingFilePath = path.join(avatarDir, existingFilename);
        if (
          existingFilename !== finalFilename &&
          existsSync(existingFilePath)
        ) {
          await unlink(existingFilePath);
        }
      } catch (deleteError) {
        console.warn("Failed to delete existing avatar:", deleteError);
      }
    }

    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: existingAvatar
        ? "Avatar replaced successfully"
        : "Avatar uploaded successfully",
      filename: finalFilename,
      path: `/uploads/profile/${finalFilename}`,
      success: true,
      replaced: !!existingAvatar,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
