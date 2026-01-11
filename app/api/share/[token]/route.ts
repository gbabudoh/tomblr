import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl } from "@/lib/storage";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET - Access shared file
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const file = await prisma.file.findFirst({
      where: { shareToken: token, isPublic: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found or not shared" }, { status: 404 });
    }

    const url = await getDownloadUrl(file.storageKey);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
      },
      downloadUrl: url,
    });
  } catch (error) {
    console.error("Share access error:", error);
    return NextResponse.json({ error: "Failed to access file" }, { status: 500 });
  }
}
