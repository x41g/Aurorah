"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

type Slot = 0 | 1 | 2; // 0=esq, 1=meio, 2=dir

export default function TestimonialCarousel() {
  const items = (config.testimonials ?? []) as Testimonial[];
  const intervalMs = config.testimonialCarousel?.intervalMs ?? 2000;

  // o item "do meio" (em destaque)
  const [active, setActive] = useState(0);

  // 3 cards com ids fixos, cada um aponta para um item e um slot (posição)
  const [cards, setCards] = useState(() => {
    const len = items.length || 1;
    return [
      { id: "A", itemIndex: clampIndex(active - 1, len), slot: 0 as Slot }, // esquerdo
      { id: "B", itemIndex: clampIndex(active, len), slot: 1 as Slot },     // meio
      { id: "C", itemIndex: clampIndex(active + 1, len), slot: 2 as Slot }, // direito
    ];
  });

  // quando items mudam (hot reload), garante estado consistente
  useEffect(() => {
    if (items.length <= 0) return;
    setCards([
      { id: "A", itemIndex: clampIndex(active - 1, items.length), slot: 0 as Slot },
      { id: "B", itemIndex: clampIndex(active, items.length), slot: 1 as Slot },
      { id: "C", itemIndex: clampIndex(active + 1, items.length), slot: 2 as Slot },
    ]);
  }, [items.length]); // intencionalmente só pelo length

  // autoplay: roda o loop
  useEffect(() => {
    if (items.length <= 1) return;

    const id = window.setInterval(() => {
      // 1) o destaque anda pra frente (active + 1)
      setActive((prev) => clampIndex(prev + 1, items.length));

      // 2) rotaciona as posições:
      // direita -> meio, meio -> esquerda, esquerda -> direita
      setCards((prev) => {
        // mapeia slots antigos -> novos slots
        const next = prev.map((c) => {
          const newSlot: Slot = c.slot === 2 ? 1 : c.slot === 1 ? 0 : 2;
          return { ...c, slot: newSlot };
        });

        // 3) o card que acabou de "pular" pra direita (slot 2) precisa trocar o conteúdo
        // para virar o novo "próximo" (active + 1)
        const nextActive = clampIndex(active + 1, items.length);
        const newRightItem = clampIndex(nextActive + 1, items.length);

        // Qual card está em slot 2 agora?
        const idxRight = next.findIndex((c) => c.slot === 2);
        if (idxRight !== -1) {
          next[idxRight] = { ...next[idxRight], itemIndex: newRightItem };
        }

        // Também ajusta o card do meio (slot 1) pra garantir que é o active atual
        const idxMid = next.findIndex((c) => c.slot === 1);
        if (idxMid !== -1) {
          next[idxMid] = { ...next[idxMid], itemIndex: nextActive };
        }

        // E o esquerdo (slot 0) vira active-1
        const idxLeft = next.findIndex((c) => c.slot === 0);
        if (idxLeft !== -1) {
          next[idxLeft] = {
            ...next[idxLeft],
            itemIndex: clampIndex(nextActive - 1, items.length),
          };
        }

        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [items.length, intervalMs, active]);

  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card item={items[0]} active />
      </div>
    );
  }

  // posições fixas (não sai da tela)
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
    <div className="mx-auto w-full max-w-6xl">
      {/* DESKTOP: 3 cards viajam entre slots */}
      <div className="relative hidden h-[260px] md:block overflow-hidden">
        {cards.map((c) => {
          const item = items[c.itemIndex];
          const isMid = c.slot === 1;

          return (
            <motion.div
              key={c.id} // ids fixos: A/B/C, não pisca
              className="absolute left-1/2 top-0 w-[42%]"
              style={{ translateX: "-50%" }}
              animate={slotStyle(c.slot)}
              transition={t}
            >
              <Card item={item} active={isMid} />
            </motion.div>
          );
        })}
      </div>

      {/* MOBILE: 1 card */}
      <div className="md:hidden">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
        >
          <Card item={items[active]} active />
        </motion.div>
      </div>

      {/* bolinhas */}
      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                "h-2 w-2 rounded-full transition-opacity bg-white",
                i === active ? "opacity-100" : "opacity-40",
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
