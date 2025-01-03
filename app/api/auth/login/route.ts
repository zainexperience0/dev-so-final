import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signIn } from "@/next-auth";
import { getUserByEmail } from "@/lib/auth/user";
import { getVerificationTokenByEmail } from "@/lib/auth/verificationToken";
import { sendVerificationEmail } from "@/lib/auth/Mailing";
import { getTwoFactorTokenByEmail } from "@/lib/auth/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/lib/auth/two-factor-confirmation";

export async function POST(req: NextRequest) {
  try {
    const { email, password, code } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);

    // Check if user exists and has a password
    if (!existingUser || !existingUser.password) {
      return NextResponse.json(
        { error: "User not found. Please enter a valid email." },
        { status: 400 }
      );
    }

    // Check if email is verified
    if (!existingUser.emailVerified) {
      const verificationToken = await getVerificationTokenByEmail(email);
      if (verificationToken) {
        await sendVerificationEmail(verificationToken.email, verificationToken.token);
      }
      return NextResponse.json(
        { error: "Please confirm your email." },
        { status: 400 }
      );
    }

    // Handle two-factor authentication
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      if (code) {
        const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

        if (!twoFactorToken || twoFactorToken.token !== code) {
          return NextResponse.json({ error: "Invalid code!" }, { status: 400 });
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date();
        if (hasExpired) {
          return NextResponse.json({ error: "Code expired!" }, { status: 400 });
        }

        // Delete the used token
        await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

        const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
        if (existingConfirmation) {
          await db.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
        }

        await db.twoFactorConfirmation.create({
          data: { userId: existingUser.id },
        });

        return NextResponse.json({ success: "Two-factor authentication successful." }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Two-factor code is required." },
          { status: 400 }
        );
      }
    }

    // Check password validity
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 400 }
      );
    }

    // Sign in the user
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result || result.error) {
      return NextResponse.json(
        { error: result?.error || "Failed to sign in. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: "Sign-in successful." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}