import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isTwoFactorEnabled: boolean;
            isOAuth: boolean;
            username: string
        } & DefaultSession["user"]
    }
}