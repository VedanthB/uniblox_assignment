"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            MyStore
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="/products" className="text-gray-600 hover:text-gray-800">
              Products
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-gray-800">
              Cart
            </Link>
            <Link href="/orders" className="text-gray-600 hover:text-gray-800">
              Orders
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {session ? (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button variant="outline" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
