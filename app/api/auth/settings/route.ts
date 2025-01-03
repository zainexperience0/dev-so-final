import { currentUser } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/auth/generateTokens";
import { sendVerificationEmail } from "@/lib/auth/Mailing";
import { getUserByEmail, getUserById } from "@/lib/auth/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const fields = await req.json();
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
        }
        const dbUser = await getUserById(user.id);
        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }
        if (user.isOAuth) {
            fields.email = undefined;
            fields.password = undefined;
            fields.isTwoFactorEnabled = undefined;
        }
        if (fields.email && fields.email !== user.email) {
            const existingUser = await getUserByEmail(fields.email);
            if (existingUser && existingUser.id !== user.id) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
            const verificationToken = await generateVerificationToken(
                fields.email
            );
            await sendVerificationEmail(
                verificationToken.email,
                verificationToken.token,
            );

            return NextResponse.json({
                success: "Verification email sent!",
            }, { status: 200 });
        }
        if (fields.password && dbUser.password) {
            const passwordsMatch = await bcrypt.compare(fields.password, dbUser.password);

            if (!passwordsMatch) {
                return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(fields.password, 10);
            fields.password = fields?.password ? hashedPassword : dbUser.password; // Assign the hashed password
        }

        await db.user.update({
            where: { id: user.id },
            data: { ...fields },
        })
        return NextResponse.json({ success: "Settings updated!" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}