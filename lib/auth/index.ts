import { auth } from "@/next-auth";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};
