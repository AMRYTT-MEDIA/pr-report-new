import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { generateDomainUuidFilename } from "@/lib/utils";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("logo");
    const existingLogo = formData.get("existingLogo");
    const websiteUrl = formData.get("websiteUrl");
    const websiteName = formData.get("websiteName");

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/svg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Maximum 10MB allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Create website-logos directory if it doesn't exist
    const logoDir = path.join(process.cwd(), "public/uploads/websites-logos");
    if (!existsSync(logoDir)) {
      await mkdir(logoDir, { recursive: true });
    }

    // Generate filename with domain + UUID format
    let finalFilename;

    if (existingLogo) {
      // For edits, reuse the same filename (domain + UUID)
      const existingFilename = existingLogo.includes("/") ? existingLogo.split("/").pop() : existingLogo;

      // Extract the UUID from existing filename (format: domain-uuid.ext)
      const filenameWithoutExt = existingFilename.replace(/\.[^/.]+$/, "");
      const parts = filenameWithoutExt.split("-");

      if (parts.length >= 2) {
        // Keep the same UUID, just update extension if needed
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const uuid = parts[parts.length - 1]; // Last part should be UUID
        const domain = parts.slice(0, -1).join("-"); // Everything except last part
        finalFilename = `${domain}-${uuid}.${fileExtension}`;
      } else {
        // Fallback: generate new filename
        finalFilename = generateDomainUuidFilename(websiteUrl, websiteName, file.name);
      }
    } else {
      // For new uploads, generate domain + UUID filename
      finalFilename = generateDomainUuidFilename(websiteUrl, websiteName, file.name);
    }

    const filePath = path.join(logoDir, finalFilename);

    // If updating existing logo, try to delete the old file first
    if (existingLogo) {
      try {
        // Extract filename from existing logo path
        const existingFilename = existingLogo.includes("/") ? existingLogo.split("/").pop() : existingLogo;

        const existingFilePath = path.join(logoDir, existingFilename);

        // Only delete if it's a different file than what we're uploading
        if (existingFilename !== finalFilename && existsSync(existingFilePath)) {
          await unlink(existingFilePath);
          console.log(`Deleted existing logo: ${existingFilename}`);
        }
      } catch (deleteError) {
        console.warn("Failed to delete existing logo:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Write the new file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: existingLogo ? "Logo replaced successfully" : "Logo uploaded successfully",
      filename: finalFilename,
      path: `/uploads/websites-logos/${finalFilename}`,
      success: true,
      replaced: !!existingLogo,
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
}
