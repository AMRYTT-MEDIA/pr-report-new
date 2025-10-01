import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarFilename = searchParams.get("filename");

    if (!avatarFilename) {
      return NextResponse.json({ error: "No avatar filename provided." }, { status: 400 });
    }

    const filename = avatarFilename.includes("/") ? avatarFilename.split("/").pop() : avatarFilename;

    const avatarDir = path.join(process.cwd(), "public/uploads/profile");
    const filePath = path.join(avatarDir, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json({
        message: "Avatar file not found, may have been already deleted",
        filename,
        success: true,
        found: false,
      });
    }

    await unlink(filePath);

    return NextResponse.json({
      message: "Avatar deleted successfully",
      filename,
      success: true,
      found: true,
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json({ error: "Failed to delete avatar file", details: error.message }, { status: 500 });
  }
}
