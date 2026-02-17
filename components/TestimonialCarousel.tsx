"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { config } from "@/config";

function clampIndex(i: number, len: number) {
  return (i + len) % len;
}

type Testimonial = {
  name: string;
  role: string;
  text: string;
  avatarUrl: string;
};

type Slot = 0 | 1 | 2;

export default function TestimonialCarousel() {
  const items = (config.testimonials ?? []) as Testimonial[];
  const intervalMs = Math.max(1800, Number(config.testimonialCarousel?.intervalMs ?? 3200));

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const slots = useMemo(() => {
    const len = items.length || 1;
    return [
      { slot: 0 as Slot, itemIndex: clampIndex(active - 1, len) },
      { slot: 1 as Slot, itemIndex: clampIndex(active, len) },
      { slot: 2 as Slot, itemIndex: clampIndex(active + 1, len) },
    ];
  }, [active, items.length]);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      setActive((prev) => clampIndex(prev + 1, items.length));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs, paused]);

  function next() {
    setActive((prev) => clampIndex(prev + 1, items.length));
  }

  function prev() {
    setActive((prev) => clampIndex(prev - 1, items.length));
  }

  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card item={items[0]} active />
      </div>
    );
  }

  const X = [-350, 0, 350] as const;
  const t = { ease: [0.22, 1, 0.36, 1] as const, duration: 0.55 };

  const slotStyle = (slot: Slot) => {
    const isMid = slot === 1;
    return {
      x: X[slot],
      scale: isMid ? 1 : 0.94,
      opacity: isMid ? 1 : 0.25,
      zIndex: isMid ? 30 : 10,
    };
  };

  return (
    <div
      className="mx-auto w-full max-w-6xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative hidden h-[260px] md:block overflow-hidden">
        {slots.map((c) => {
          const item = items[c.itemIndex];
          const isMid = c.slot === 1;

          return (
            <motion.div
              key={`${c.slot}-${c.itemIndex}`}
              className="absolute left-1/2 top-0 w-[42%]"
              style={{ translateX: "-50%" }}
              initial={false}
              animate={slotStyle(c.slot)}
              transition={t}
            >
              <Card item={item} active={isMid} />
            </motion.div>
          );
        })}
      </div>

      <div className="md:hidden">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
        >
          <Card item={items[active]} active />
        </motion.div>
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 inline-flex items-center justify-center"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={next}
            className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 inline-flex items-center justify-center"
            aria-label="Proximo depoimento"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                "h-2.5 rounded-full transition-all duration-300 bg-white",
                i === active ? "w-5 opacity-100" : "w-2.5 opacity-40 hover:opacity-70",
              ].join(" ")}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ item, active }: { item: Testimonial; active?: boolean }) {
  return (
    <div
      className={[
        "h-full w-full rounded-2xl border border-white/10",
        "bg-gradient-to-br from-purple-900/40 to-pink-900/30",
        "p-6 backdrop-blur",
        active ? "shadow-[0_0_60px_rgba(168,85,247,0.18)]" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <img
          src={item.avatarUrl}
          alt={item.name}
          className="h-12 w-12 rounded-full object-cover border border-white/10"
        />
        <div className="min-w-0">
          <div className="text-white font-semibold">{item.name}</div>
          <div className="text-white/70 text-sm">{item.role}</div>
          <div className="mt-4 text-white/90 leading-relaxed">{item.text}</div>
        </div>
      </div>
    </div>
  );
}
