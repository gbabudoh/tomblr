"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// Admin Statistics
export async function getAdminStats() {
  try {
    const [totalUsers, totalFiles, totalStorageUsed] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.user.aggregate({
        _sum: { storageUsed: true }
      })
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        totalFiles,
        totalStorageUsed: Number(totalStorageUsed._sum.storageUsed || 0),
      }
    };
  } catch {
    console.error("Admin action error");
    return { success: false };
  }
}

// User Management
export async function getUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        createdAt: true,
        _count: {
          select: { files: true }
        }
      }
    });

    return { success: true, users };
  } catch {
    console.error("Get users error");
    return { success: false };
  }
}

export async function updateUserRole(userId: string, role: Role) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false };
  }
}

// Access Code Management
export async function generateAccessCodes(count: number = 5) {
  try {
    const codes = Array.from({ length: count }).map(() => ({
      code: `TMB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    }));

    await prisma.accessCode.createMany({
      data: codes
    });

    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getAccessCodesAction() {
  try {
    const codes = await prisma.accessCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return { success: true, codes };
  } catch {
    return { success: false };
  }
}
