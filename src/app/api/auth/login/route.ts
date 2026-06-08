import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required login credentials" },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password combination" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordMatch = await comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password combination" },
        { status: 401 }
      );
    }

    // Log user access session
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionDescription: `Signed in`,
      },
    });

    // Create session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        message: "Authentication successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Exception:", error);
    return NextResponse.json(
      { error: "Internal Auth Decryption Error" },
      { status: 500 }
    );
  }
}
