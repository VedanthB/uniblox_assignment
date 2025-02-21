import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req });

  const adminRoutes = ["/admin"];
  const userRoutes = ["/checkout"];

  if (adminRoutes.includes(pathname)) {
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  if (userRoutes.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

// Configure the middleware should apply to
export const config = {
  matcher: ["/admin/:path*", "/checkout"],
};
