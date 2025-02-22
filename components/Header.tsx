"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { META_THEME_COLORS, useMetaColor } from "@/hooks/use-meta-color";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Sparkle, LogOut, MoonIcon, SunIcon, User } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userImage = "https://github.com/shadcn.png"; // Use image only if logged in

  const { setTheme, resolvedTheme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    setMetaColor(newTheme === "dark" ? META_THEME_COLORS.dark : META_THEME_COLORS.light);
  }, [resolvedTheme, setTheme, setMetaColor]);

  return (
    <header className="border-b border-border/50 dark:border-border border-dashed sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left - Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold transition hover:text-primary">
            <Sparkle className="h-6 w-6 text-primary" />
            <span>ShopEase</span>
          </Link>
        </div>

        {/* Right - Cart, Account Dropdown */}
        <div className="flex items-center space-x-6">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className={cn(
              "relative transition-colors hover:text-primary",
              pathname?.startsWith("/cart") ? "text-primary" : "text-gray-600",
            )}
          >
            <ShoppingCart className="h-6 w-6" />
          </Link>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                {session ? <AvatarImage src={userImage} alt="User Avatar" /> : <AvatarFallback>U</AvatarFallback>}
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              {/* Theme Toggle */}
              <DropdownMenuItem onClick={toggleTheme} className="flex items-center cursor-pointer gap-2">
                {resolvedTheme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-blue-500" />
                )}
                <span>Change Theme</span>
              </DropdownMenuItem>

              {/* Orders */}
              {session && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              {/* Sign In / Sign Out */}
              {session ? (
                <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer gap-2">
                  <LogOut className="h-5 w-5 text-red-500" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
