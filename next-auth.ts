import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";
import { generateFromEmail } from "unique-username-generator";
import { nanoid } from "nanoid";
import authConfig from "./next-auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  events: {
    createUser: async ({ user }) => {
      const email = user.email || "";
      const username = generateFromEmail(email, 3);
      const password = bcrypt.hashSync(nanoid(10), 12);
      await db.user.update({
        where: {
          email,
        },
        data: {
          username,
          password,
        },
      });
    },
    linkAccount: async ({ user }) => {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async jwt({ token }) {
      const id = token.sub;
      if (!id) return token;
      const dbUser = await db.user.findUnique({
        where: {
          id,
        },
        select: {
          username: true,
        },
      });
      return {
        ...token,
        username: dbUser?.username,
      };
    },
    async session({ session, token }) {
     if(token.sub){
      session.user.id = token.sub;
     }
     if(token.username){
      session.user.username = token.username as string;
     }
      return session;
    },
  },
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
});
