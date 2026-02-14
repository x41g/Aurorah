import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const raw = params.slug || "";
  const clean = raw.endsWith(".html") ? raw.slice(0, -5) : raw;

  // URL absoluta baseada no request atual (funciona em prod/preview/domínio)
  const url = new URL(`/transcript/${clean}`, req.url);

  return NextResponse.redirect(url, 302);
}
