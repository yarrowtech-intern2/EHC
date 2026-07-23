"use client";

import { Brain, FileSearch, ImageIcon, TrendingUp } from "lucide-react";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";
import { VideoPlayer } from "../common/VideoPlayer";
import { cdn } from "@/data/landing2-assets";

const capabilities = [
  { icon: Brain, title: "Pattern recognition" },
  { icon: FileSearch, title: "Report classification" },
  { icon: ImageIcon, title: "Medical image support" },
  { icon: TrendingUp, title: "Treatment progress" },
];

export function AIInsightsShowcase() {
  return (
    <section className="bg-[#f3f1ef] py-20 text-primary-text sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <VideoPlayer
              src={cdn.videos.aiInsights}
              poster={cdn.posters.aiInsights}
              className="rounded-2xl"
              aspectRatio="4/3"
            />
          </FadeIn>

          <FadeIn direction="right" delay={0.1}>
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-brand">
              AI-Assisted
            </p>
            <EditorialTitle
              as="h2"
              align="left"
              size="section"
              className="max-w-[760px]"
              lines={[
                "Insights that support",
                <>
                  <EditorialHighlight>better</EditorialHighlight> decisions.
                </>,
              ]}
            />

            <p className="mt-4 text-base leading-relaxed text-secondary-text">
              Organise information, identify patterns and understand patient
              progress more efficiently.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {capabilities.map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-brand" strokeWidth={1.5} />
                  <span className="text-[14px] text-secondary-text">{title}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 max-w-sm text-[11px] leading-relaxed text-secondary-text/70">
              AI insights support healthcare professionals and do not replace
              medical diagnosis or treatment decisions.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
