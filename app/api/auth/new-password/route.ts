import { getPasswordResetTokenByToken } from "@/lib/auth/getPasswordResetToken";
import { getUserByEmail } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();
        if (!token) {
            return NextResponse.json({ error: "Missing token!" }, { status: 400 });
        }
        const existingToken = await getPasswordResetTokenByToken(token);

        if (!existingToken) {
            return NextResponse.json({ error: "Invalid token!" }, { status: 400 });
        }
        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return NextResponse.json({ error: "Token has expired!" }, { status: 400 });
        }

        const existingUser = await getUserByEmail(existingToken.email);

        if (!existingUser) {
            return NextResponse.json({ error: "User not found!" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
        });

        await db.passwordResetToken.delete({
            where: { id: existingToken.id }
        });

        return NextResponse.json({ success: "Password reset successful!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}