"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    tag: "01 — Intelligence",
    title: "Logic That\nWorks For You",
    description: "Harness the power of generative AI to automate the complex, surface the insight, and move faster than ever before.",
    bg: "bg-[#050505]",
    text: "text-white",
    accent: "text-white",
  },
  {
    tag: "02 — Integration",
    title: "Built for the Way\nYou Actually Work",
    description: "Seamlessly fits into your existing workflow — no steep learning curve, no friction, just results from day one.",
    bg: "bg-[#111111]",
    text: "text-white",
    accent: "text-white",
  },
  {
    tag: "03 — Velocity",
    title: "From Prompt to\nOutcome, Instantly",
    description: "Turn ideas into outputs in seconds. Whatever you're building toward, AI gets you there faster.",
    bg: "bg-[#050505]",
    text: "text-white",
    accent: "text-white",
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const sections = gsap.utils.toArray<HTMLElement>(".feature-section");

    mm.add("(prefers-reduced-motion: no-preference)", () => {
        sections.forEach((section, i) => {
          const container = section.querySelector(".feature-container");

          if (i > 0) {
            gsap.set(container, { rotation: 30, transformOrigin: "bottom left" });
            gsap.to(container, {
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 25%",
                scrub: true,
              },
            });
          }

          if (i < sections.length - 1) {
            ScrollTrigger.create({
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              pin: true,
              pinSpacing: false,
            });
          }
        });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
        sections.forEach((section) => {
            const container = section.querySelector(".feature-container");
            gsap.set(container, { rotation: 0 });
        });
    });
  }, { scope: containerRef });

  return (
    <div id="features" ref={containerRef} className="relative">
      {FEATURES.map((feature, i) => (
        <section key={i} className="feature-section relative h-screen w-full overflow-hidden">
          <div className={cn(
            "feature-container relative h-full w-full p-8 md:p-20 flex flex-col justify-between border-t border-white/5",
            feature.bg,
            feature.text
          )}>
            <div className="flex flex-col gap-8">
                <p className={cn("font-mono text-xs tracking-widest uppercase opacity-60", feature.accent)}>{feature.tag}</p>
                <div className="h-px w-full bg-current opacity-20" />
                <h2 className="font-sans font-bold text-5xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter uppercase whitespace-pre-line">
                    {feature.title}
                </h2>
            </div>

            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="h-px w-full bg-current opacity-20 md:hidden" />
                <p className="font-sans text-lg md:text-2xl max-w-xl opacity-70 leading-relaxed">
                    {feature.description}
                </p>
                <div className="font-mono text-xs opacity-40 uppercase tracking-widest hidden md:block">
                    Neuro // v1.0.42
                </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
