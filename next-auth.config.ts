import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter email and password.");
        }
        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });
        if (!user || !user?.password) {
          throw new Error("User was not found, Please enter valid email");
        }
        const passwordMatch = bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!passwordMatch) {
          throw new Error(
            "The entered password is incorrect, please enter the correct one."
          );
        }
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
