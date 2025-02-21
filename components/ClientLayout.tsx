"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensures that hydration happens only after mount
  }, []);

  if (!mounted) {
    return null; // Prevents mismatched server/client HTML
  }

  return <SessionProvider>{children}</SessionProvider>;
}
