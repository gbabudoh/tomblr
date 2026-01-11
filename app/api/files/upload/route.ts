import { NextRequest, NextResponse } from "next/server";
import { uploadFile, ensureBucket } from "@/lib/storage";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Ensure bucket exists
    await ensureBucket();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to MinIO
    const storageKey = await uploadFile(buffer, file.name, file.type);

    // Save to database
    const dbFile = await prisma.file.create({
      data: {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        storageKey,
        userId,
        folderId: folderId || null,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: dbFile.id,
        name: dbFile.name,
        size: dbFile.size,
        mimeType: dbFile.mimeType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
