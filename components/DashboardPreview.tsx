"use client";

import DashboardGeminiPreview from "@/components/DashboardGeminiPreview";

export default function DashboardPreview() {
  return (
    <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] min-h-[240px] sm:min-h-[420px] overflow-hidden rounded-[18px] sm:rounded-[22px] bg-[#0b1122]">
      <DashboardGeminiPreview />
    </div>
  );
}
