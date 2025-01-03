import { getUserByEmail } from "@/lib/auth/user";
import { getVerificationTokenByToken } from "@/lib/auth/verificationToken";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // Validate token
    if (!token) {
      return NextResponse.json({ error: "Missing token!" }, { status: 400 });
    }

    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid token!" }, { status: 400 });
    }

    // Check token expiration
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({ error: "Token has expired!" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found!" }, { status: 400 });
    }

    // Update user email verification status
    await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    });

    // Delete the used verification token
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error in verification:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
