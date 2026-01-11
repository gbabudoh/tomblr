import { DefaultSession, DefaultUser } from "next-auth";
import { Role, SubscriptionTier } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tier: SubscriptionTier;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    tier: SubscriptionTier;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tier: SubscriptionTier;
  }
}
