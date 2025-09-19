// app/api/tmp/[filename]/route.ts
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function GET(
  req,
  { params }
) {
  const filePath = path.join(os.tmpdir(), 'websites-logos', params.filename);

  try {
    const buffer = await fs.readFile(filePath);
    // set correct content-type based on your file
    return new Response(buffer, {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}