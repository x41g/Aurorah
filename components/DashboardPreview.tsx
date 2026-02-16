"use client";

import DashboardGeminiPreview from "@/components/DashboardGeminiPreview";

export default function DashboardPreview() {
  return (
    <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] min-h-[340px] sm:min-h-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/10">
      <DashboardGeminiPreview />
    </div>
  );
}
