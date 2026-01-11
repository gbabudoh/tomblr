"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function verifyAccessCode(code: string) {
  try {
    const accessCode = await prisma.accessCode.findUnique({
      where: { code },
    });

    if (!accessCode) {
      return { success: false, message: "Invalid access code." };
    }

    if (accessCode.isUsed) {
      return { success: false, message: "This code has already been used." };
    }

    if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
      return { success: false, message: "This code has expired." };
    }

    // Set a session cookie to allow access to registration
    const cookieStore = await cookies();
    cookieStore.set("tomblr_verified_code", code, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  } catch (error) {
    console.error("Error verifying access code:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const company = (formData.get("company") as string) || null;
  const phoneNumber = (formData.get("phoneNumber") as string) || null;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  if (password !== confirmPassword) {
    return { success: false, message: "Codes do not match." };
  }

  if (!/^\d{6}$/.test(password)) {
    return { success: false, message: "Code must be exactly 6 digits." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        company,
        phoneNumber,
        email,
        password: hashedPassword,
      } as Parameters<typeof prisma.user.create>[0]["data"],
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error registering user:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { success: false, message: "Email or Phone Number already in use." };
    }
    return { success: false, message: "Registration failed. Please try again." };
  }
}
