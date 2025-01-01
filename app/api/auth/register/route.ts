import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 12);
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
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
        },
      });
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
