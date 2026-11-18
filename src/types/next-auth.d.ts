import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      category: string;
    };
  }

  interface User {
    sessionVersion?: number;
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    category: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionVersion?: number;
    userId?: string;
    role?: string;
    category?: string;
  }
}
