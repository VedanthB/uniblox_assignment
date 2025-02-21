import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by useSession, getSession, returned by the session callback and also the shape received as a prop on the SessionProvider React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      id: string;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    /** The user's role. */
    id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    id: string;
    role?: string;
  }
}
