import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";
import { generateFromEmail } from "unique-username-generator";
import { nanoid } from "nanoid";
import authConfig from "./next-auth.config";
import { getUserByEmail, getUserById } from "./lib/auth/user";
import { getTwoFactorConfirmationByUserId } from "./lib/auth/two-factor-confirmation";

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
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;
      const existingAccount = await db.account.findFirst({
        where: {
          userId: existingUser.id,
        },
      })
      const dbUser = await db.user.findUnique({
        where: {
          id: existingUser.id,
        }
      })
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      return {
        ...token,
        username: dbUser?.username,
      };
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.username) {
        session.user.username = token.username as string;
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      const existingUser = await getUserById(user.id!);
      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(user.id!);
        if (!twoFactorConfirmation) return false;
        await db.twoFactorConfirmation.delete({
          where: {
            id: twoFactorConfirmation.id,
          },
        })
      }
      return true;
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
