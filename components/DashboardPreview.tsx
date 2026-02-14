"use client";

import DashboardGeminiPreview from "@/components/DashboardGeminiPreview";

export default function DashboardPreview() {
  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-white/10">
      <DashboardGeminiPreview />
    </div>
  );
}
