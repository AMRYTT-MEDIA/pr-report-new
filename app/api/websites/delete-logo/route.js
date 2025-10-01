import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const logoFilename = searchParams.get("filename");

    if (!logoFilename) {
      return NextResponse.json({ error: "No logo filename provided." }, { status: 400 });
    }

    // Extract just the filename from the logo path
    const filename = logoFilename.includes("/") ? logoFilename.split("/").pop() : logoFilename;

    // Construct the full path to the logo file
    const logoDir = path.join(process.cwd(), "public/uploads/websites-logos");
    const filePath = path.join(logoDir, filename);

    // Check if file exists before trying to delete
    if (!existsSync(filePath)) {
      return NextResponse.json({
        message: "Logo file not found, may have been already deleted",
        filename,
        success: true,
        found: false,
      });
    }

    // Delete the file
    await unlink(filePath);
    console.log(`Successfully deleted logo file: ${filename}`);

    return NextResponse.json({
      message: "Logo deleted successfully",
      filename,
      success: true,
      found: true,
    });
  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      {
        error: "Failed to delete logo file",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
