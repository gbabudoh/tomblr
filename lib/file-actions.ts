"use server";

import prisma from "@/lib/prisma";
import { uploadFile, deleteFile, getDownloadUrl, ensureBucket } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Types
interface UploadResult {
  success: boolean;
  message?: string;
  file?: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
  };
}

interface FileListResult {
  success: boolean;
  files?: Array<{
    id: string;
    name: string;
    size: number;
    mimeType: string;
    createdAt: Date;
    isPublic: boolean;
  }>;
  folders?: Array<{
    id: string;
    name: string;
    color: string | null;
    createdAt: Date;
  }>;
  message?: string;
}

interface UsageResult {
  success: boolean;
  usage?: {
    used: number;
    limit: number;
    percentage: number;
    tier: string;
  };
  message?: string;
}

// Ensure storage bucket exists on first use
let bucketInitialized = false;
async function initBucket() {
  if (!bucketInitialized) {
    try {
      await ensureBucket();
      bucketInitialized = true;
    } catch (error) {
      console.error("Failed to init bucket:", error);
    }
  }
}

// Upload a file
export async function uploadFileAction(
  formData: FormData,
  userId: string,
  folderId?: string
): Promise<UploadResult> {
  try {
    await initBucket();
    
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, message: "No file provided" };
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

    revalidatePath("/dashboard");

    return {
      success: true,
      file: {
        id: dbFile.id,
        name: dbFile.name,
        size: Number(dbFile.size),
        mimeType: dbFile.mimeType,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, message: "Failed to upload file" };
  }
}

// Get files for a user
export async function getFilesAction(
  userId: string,
  folderId?: string
): Promise<FileListResult> {
  try {
    // Use raw query to bypass Prisma Client's strict runtime check for the 'order' field (if used) or other schema updates
    const files = await prisma.$queryRawUnsafe<{ id: string, name: string, size: bigint, mimeType: string, createdAt: Date, isPublic: boolean }[]>(
      `SELECT "id", "name", "size", "mimeType", "createdAt", "isPublic" 
       FROM "File" 
       WHERE "userId" = $1 AND "folderId" ${folderId ? "= $2" : "IS NULL"} 
       ORDER BY "createdAt" DESC`,
      userId,
      ...(folderId ? [folderId] : [])
    );

    // Use raw query to bypass Prisma Client's strict runtime check for the 'color' field
    const folders = await prisma.$queryRawUnsafe<{ id: string, name: string, color: string | null, createdAt: Date, parentId: string | null }[]>(
      `SELECT "id", "name", "color", "createdAt", "parentId" 
       FROM "Folder" 
       WHERE "userId" = $1 AND "parentId" ${folderId ? "= $2" : "IS NULL"} 
       ORDER BY "createdAt" DESC`,
      userId,
      ...(folderId ? [folderId] : [])
    );

    return { 
      success: true, 
      files: files.map((f) => ({ ...f, size: Number(f.size) })), 
      folders: folders.map((f) => ({ ...f }))
    };
  } catch (error) {
    console.error("Get files error:", error);
    return { success: false, message: "Failed to get files" };
  }
}

// Get storage usage
export async function getUsageAction(userId: string): Promise<UsageResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageLimit: true, tier: true },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const used = Number(user.storageUsed);
    const limit = Number(user.storageLimit);
    const percentage = Math.round((used / limit) * 100);

    return {
      success: true,
      usage: {
        used,
        limit,
        percentage,
        tier: user.tier,
      },
    };
  } catch (error) {
    console.error("Get usage error:", error);
    return { success: false, message: "Failed to get usage info" };
  }
}

// Create folder
export async function createFolderAction(
  userId: string,
  name: string,
  color?: string,
  parentId?: string
): Promise<{ success: boolean; folder?: { id: string; name: string }; message?: string }> {
  try {
    // Use raw SQL insert to bypass stale Prisma Client validation of the 'color' field
    const id = `fld_${crypto.randomBytes(8).toString("hex")}`;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // We use $executeRaw as a more robust way to handle dynamic schema changes 
    // when the Prisma Client metadata is out of sync in the dev server.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Folder" ("id", "name", "color", "userId", "parentId", "order", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      id,
      name,
      color || "#6D28D9",
      userId,
      (parentId && parentId !== "") ? parentId : null,
      0,
      createdAt,
      updatedAt
    );

    revalidatePath("/dashboard");

    return { success: true, folder: { id, name } };
  } catch (error) {
    console.error("Create folder error:", error);
    return { success: false, message: "Failed to create folder" };
  }
}

// Delete file
export async function deleteFileAction(
  fileId: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      return { success: false, message: "File not found" };
    }

    // Delete from storage
    await deleteFile(file.storageKey);

    // Delete from database
    await prisma.file.delete({
      where: { id: fileId },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete file error:", error);
    return { success: false, message: "Failed to delete file" };
  }
}

// Delete folder recursively
export async function deleteFolderAction(
  folderId: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Get all files in this folder and subfolders to delete from storage
    // We'll do this recursively or just find everything with this parent
    // For simplicity, let's find all files that will be orphaned
    
    const getAllFiles = async (fid: string): Promise<string[]> => {
      const files = await prisma.file.findMany({
        where: { folderId: fid, userId },
        select: { storageKey: true }
      });
      
      const subFolders = await prisma.folder.findMany({
        where: { parentId: fid, userId },
        select: { id: true }
      });
      
      let keys = files.map(f => f.storageKey);
      for (const sub of subFolders) {
        keys = [...keys, ...(await getAllFiles(sub.id))];
      }
      return keys;
    };

    const storageKeys = await getAllFiles(folderId);

    // 2. Delete from MinIO
    for (const key of storageKeys) {
      await deleteFile(key);
    }

    // 3. Delete from database (Prisma handles subfolders/files cascading if configured, 
    // but we use raw SQL to be safe given the earlier client issues)
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Folder" WHERE "id" = $1 AND "userId" = $2`,
      folderId,
      userId
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete folder error:", error);
    return { success: false, message: "Failed to delete folder" };
  }
}

// Get download URL
export async function getFileDownloadUrl(
  fileId: string,
  userId: string
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      return { success: false, message: "File not found" };
    }

    const url = await getDownloadUrl(file.storageKey);

    return { success: true, url };
  } catch (error) {
    console.error("Get download URL error:", error);
    return { success: false, message: "Failed to get download URL" };
  }
}

// Generate share link
export async function generateShareLink(
  fileId: string,
  userId: string
): Promise<{ success: boolean; shareUrl?: string; message?: string }> {
  try {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      return { success: false, message: "File not found" };
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString("hex");

    await prisma.file.update({
      where: { id: fileId },
      data: { isPublic: true, shareToken },
    });

    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/share/${shareToken}`;

    return { success: true, shareUrl };
  } catch (error) {
    console.error("Generate share link error:", error);
    return { success: false, message: "Failed to generate share link" };
  }
}

// Update positions for rearranging
export async function updatePositionsAction(
  userId: string,
  items: Array<{ id: string; type: "file" | "folder"; order: number }>
): Promise<{ success: boolean; message?: string }> {
  try {
    const updates = items.map((item) => {
      if (item.type === "file") {
        return prisma.$executeRawUnsafe(
          `UPDATE "File" SET "order" = $1 WHERE "id" = $2 AND "userId" = $3`,
          item.order,
          item.id,
          userId
        );
      } else {
        return prisma.$executeRawUnsafe(
          `UPDATE "Folder" SET "order" = $1 WHERE "id" = $2 AND "userId" = $3`,
          item.order,
          item.id,
          userId
        );
      }
    });

    await Promise.all(updates);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update positions error:", error);
    return { success: false, message: "Failed to update positions" };
  }
}
