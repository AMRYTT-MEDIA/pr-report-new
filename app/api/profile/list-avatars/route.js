import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const avatarDir = path.join(process.cwd(), "public/uploads/profile");
    const entries = await readdir(avatarDir, { withFileTypes: true });
    const files = entries
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => /\.(png|jpe?g|svg|webp)$/i.test(name));

    return NextResponse.json({
      files,
      paths: files.map((f) => `/uploads/profile/${f}`),
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list avatars", details: error.message }, { status: 500 });
  }
}
