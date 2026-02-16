import { NextResponse } from "next/server";
import { canManageGuild } from "@/lib/guard";
import { subscribeGuildConfig } from "@/lib/guildConfigEvents";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { guildId: string } }) {
  const { guildId } = params;
  const access = await canManageGuild(guildId);
  if (!access.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const write = (txt: string) => controller.enqueue(encoder.encode(txt));

      write(`event: ready\ndata: ${JSON.stringify({ ok: true, guildId: String(guildId), ts: Date.now() })}\n\n`);

      const unsubscribe = subscribeGuildConfig(String(guildId), (event) => {
        write(`event: config\ndata: ${JSON.stringify(event)}\n\n`);
      });

      const heartbeat = setInterval(() => {
        write(`event: ping\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
      }, 20000);

      const close = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

