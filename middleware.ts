import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    if (isAdminRoute) {
      if (!isAuth || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    if (isDashboardRoute) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
