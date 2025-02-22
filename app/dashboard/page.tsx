"use client";

import { useSession, signOut } from "next-auth/react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || "unknown",
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "user", // Default to 'user' if role is missing
      });
    }
  }, [session, setUser]);

  if (!user) {
    return (
      <div>
        <h1>Not logged in</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
