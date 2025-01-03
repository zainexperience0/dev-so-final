import { generateVerificationToken } from "@/lib/auth/generateTokens";
import { sendVerificationEmail } from "@/lib/auth/Mailing";
import { getUserByEmail } from "@/lib/auth/user";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { generateFromEmail } from "unique-username-generator";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 12);
    const existingUser = await getUserByEmail(email);
    if (email) {
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          username: generateFromEmail(email, 4),
        },
      });
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
      return NextResponse.json(
        {
          user,
          success: "Confirmation Email Sent",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
