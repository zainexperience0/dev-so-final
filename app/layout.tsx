import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "dev.so", template: "%s" },
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Toaster richColors />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
