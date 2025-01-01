import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signIn } from "@/next-auth";
import { AuthError } from "next-auth";
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const existinguser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!existinguser || !existinguser.password || !existinguser.password) {
      return NextResponse.json(
        { error: "User was not found, Please enter valid email" },
        { status: 400 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, existinguser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        {
          error:
            "The entered password is incorrect, please enter the correct one.",
        },
        { status: 400 }
      );
    }

    try {
      await signIn("credentials", {
        email,
        password,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid credentials!" };
          default:
            return { error: "Something went wrong!" };
        }
      }

      throw error;
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
