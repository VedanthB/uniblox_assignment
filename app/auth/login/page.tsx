"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      toast.error("Invalid username or password");
    } else {
      router.push("/products"); // Redirect to products after login
    }
  };

  const handleAdminLogin = async () => {
    const result = await signIn("credentials", {
      redirect: false,
      username: "admin@example.com",
      password: "adminpass",
    });

    if (result?.error) {
      toast.error("Admin login failed");
    } else {
      router.push("/admin"); // Redirect to admin dashboard
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-md min-w-[300px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Log in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" type="submit">
              Login
            </Button>
            <Button className="w-full mt-2" type="button" variant="secondary" onClick={handleAdminLogin}>
              Log in as Admin
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Dont have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
