import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type MaintenanceCache = {
  value: boolean;
  fetchedAt: number;
};

const maintenanceCache: MaintenanceCache = {
  value: false,
  fetchedAt: 0,
};

function canBypassMaintenance(pathname: string) {
  if (!pathname) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/403")) return true;
  if (pathname.startsWith("/maintenance")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

async function isMaintenanceEnabled(req: NextRequest): Promise<boolean> {
  const now = Date.now();
  if (now - maintenanceCache.fetchedAt < 3500) {
    return maintenanceCache.value;
  }

  try {
    const url = new URL("/api/maintenance", req.url);
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "x-maintenance-probe": "1",
      },
    });
    const data = await res.json().catch(() => ({}));
    maintenanceCache.value = Boolean(data?.maintenance?.enabled);
    maintenanceCache.fetchedAt = now;
    return maintenanceCache.value;
  } catch {
    maintenanceCache.value = false;
    maintenanceCache.fetchedAt = now;
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname || "/";

  if (!canBypassMaintenance(pathname)) {
    const enabled = await isMaintenanceEnabled(req);
    if (enabled) {
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.rewrite(url);
    }
  }

  const res = NextResponse.next();

  // Baseline hardening headers.
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (req.nextUrl.protocol === "https:") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
