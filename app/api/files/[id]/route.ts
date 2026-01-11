import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl, deleteFile } from "@/lib/storage";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Download file (returns presigned URL)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await prisma.file.findFirst({
      where: { id, userId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const url = await getDownloadUrl(file.storageKey);

    return NextResponse.json({ success: true, url, fileName: file.name });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

// DELETE - Remove file
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await prisma.file.findFirst({
      where: { id, userId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from storage
    await deleteFile(file.storageKey);

    // Delete from database
    await prisma.file.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
