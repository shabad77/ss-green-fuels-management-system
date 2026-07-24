import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, Role } from "@/lib/session";

// Path prefixes each role is allowed to reach. Checked in addition to the
// route-specific logic inside individual API handlers (e.g. the Operator's
// 15-minute purchase edit window, or Accountant's read-only access) — this
// middleware is the coarse "can this role even be here at all" gate, and it
// runs before every page load and every API call, so hiding a sidebar link
// is never the only thing standing between a role and a page.
const ROLE_PREFIXES: Record<Role, string[]> = {
  ADMIN: ["/"], // unrestricted
  OPERATOR: [
    "/dashboard",
    "/api/dashboard",
    "/purchases",
    "/suppliers",
    "/vehicles",
    "/api/purchases",
    "/api/suppliers",
    "/api/vehicles",
  ],
  ACCOUNTANT: [
    "/dashboard",
    "/api/dashboard",
    "/sales",
    "/purchases",
    "/reports",
    "/invoice",
    "/api/sales",
    "/api/purchases",
    "/api/reports",
    "/api/invoice",
  ],
};

// Always reachable, regardless of role or auth state.
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

function isAllowed(role: Role, pathname: string): boolean {
  if (role === "ADMIN") return true;
  return ROLE_PREFIXES[role].some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const isApi = pathname.startsWith("/api");

  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAllowed(session.role, pathname)) {
    if (isApi) {
      return NextResponse.json(
        { error: "You don't have access to this." },
        { status: 403 }
      );
    }
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
