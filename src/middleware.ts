import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

 
  const protectedRoutes = ["/profile", "/checkout", "/order/track"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

 
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }


  if (pathname.startsWith("/seller")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token.role !== "seller" && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/seller/:path*",
    "/order/track/:path*",
  ],
};