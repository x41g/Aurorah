"use client";

import { useMemo, useState } from "react";

type Opt = { value: string; label: string };

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
}: {
  value?: string;
  onChange: (v: string) => void;
  options: Opt[];
  placeholder?: string;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [q, options]);

  return (
    <div className="mt-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar..."
        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-2 outline-none focus:border-white/25"
      />

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
      >
        <option value="">{placeholder}</option>
        {filtered.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
