import { generatePasswordResetToken } from "@/lib/auth/generateTokens";
import { sendPasswordResetEmail } from "@/lib/auth/Mailing";
import { getUserByEmail } from "@/lib/auth/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        console.log(email);
        
        const existingUser = await getUserByEmail(email);

        if (!existingUser) {
            return NextResponse.json({ error: "User not found!" }, { status: 400 });
        }

        const passwordResetToken = await generatePasswordResetToken(email);
        await sendPasswordResetEmail(
            passwordResetToken.email,
            passwordResetToken.token,
        );

        return NextResponse.json({ success: "Password reset email sent!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}