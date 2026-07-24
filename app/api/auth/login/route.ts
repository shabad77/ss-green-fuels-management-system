import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Enter email and password." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    // Same generic message whether the email doesn't exist or the password
    // is wrong — don't reveal which one, that leaks which emails are valid.
    const invalidMessage = "Invalid email or password.";

    if (!user) {
      return NextResponse.json({ error: invalidMessage }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json({ error: invalidMessage }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ name: user.name, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
