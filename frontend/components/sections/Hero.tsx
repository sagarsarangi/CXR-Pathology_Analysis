"use client";

import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const IMAGES = [
  "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?q=80&w=2070&auto=format&fit=crop", // Bioluminescence
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", // Neon
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop", // Tech
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop", // Circuit
  "/images/philo.jpg", // Abstract
];

export const INTRO_END_DELAY_SEC = 0.35 + (IMAGES.length - 1) * 0.25 + 1 + 1;

import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import { usePageTransition } from "@/components/layout/PageTransition";
import { createClient } from "@/lib/supabase/client";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const radialRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  const user = useAuthStore((state) => state.user);
  const { navigateTo } = usePageTransition();
  const supabase = createClient();

  const handleCoreClick = async () => {
    if (user) {
        navigateTo("/dashboard");
    } else {
        navigateTo("/auth/signin");
    }
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
        const imgs = imgRefs.current.filter(Boolean);
        const tl = gsap.timeline();

        // Entrance: staggered image reveal
        tl.to(imgs, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          delay: 0.35,
          stagger: { each: 0.25, ease: "power1.out" },
        });

        // Expand container to full screen
        tl.to(containerRef.current, {
          width: "100%",
          height: "100dvh",
          maxWidth: "none",
          aspectRatio: "unset",
          margin: 0,
          duration: 1,
          ease: "power3.inOut",
        });

        // Fade in radial gradient and content
        tl.to(
          [radialRef.current, contentRef.current, logoRef.current],
          {
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            stagger: 0.1,
          },
          ">"
        );

        // Headline reveal (manual split logic for safety)
        const headlineLines = contentRef.current?.querySelectorAll(".line-reveal");
        if (headlineLines) {
            tl.fromTo(headlineLines, 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
                "<0.3"
            );
        }
    });

    // Fallback for reduced motion
    mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([radialRef.current, contentRef.current, logoRef.current], { opacity: 1 });
        gsap.set(containerRef.current, { width: "100%", height: "100dvh", maxWidth: "none", aspectRatio: "unset", margin: 0 });
        const imgs = imgRefs.current.filter(Boolean);
        gsap.set(imgs, { clipPath: "inset(0% 0% 0% 0%)" });
        const headlineLines = contentRef.current?.querySelectorAll(".line-reveal");
        if (headlineLines) gsap.set(headlineLines, { y: 0, opacity: 1 });
    });

  }, { scope: containerRef });

  return (
    <section className="relative h-screen w-full overflow-hidden bg-primary">
      {/* Logo Overlay */}
      {/* <div ref={logoRef} className="absolute top-8 left-8 z-50 opacity-0">
            <span className="font-mono text-xl tracking-tighter text-accent font-bold underline decoration-accent/30 underline-offset-4">NEURO</span>
        </div> */}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={containerRef}
          className="relative aspect-video w-[min(88vw,28rem)] overflow-hidden md:w-[42vw] z-10"
        >
          {IMAGES.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="absolute inset-0 size-full"
              style={{ zIndex: i }}
            >
              <Image
                ref={(el) => {
                  // @ts-ignore - Image ref is tricky, but works for GSAP if accessed correctly
                  imgRefs.current[i] = el;
                }}
                src={src}
                alt=""
                fill
                priority={i === IMAGES.length - 1}
                className="object-cover"
                style={{ clipPath: "inset(0% 0% 100% 0%)" }}
              />
            </div>
          ))}

          <div
            ref={radialRef}
            className="pointer-events-none absolute inset-0 z-10 opacity-0"
            style={{
              background:
                "radial-gradient(ellipse 100% 88% at 50% 42%, transparent 22%, rgba(0,0,0,0.6) 58%, rgba(0,0,0,0.95) 100%)",
            }}
            aria-hidden
          />

          {/* Hero Content */}
          <div
            ref={contentRef}
            className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-20 opacity-0"
          >
            <div className="max-w-4xl space-y-4">
              <p className="font-mono text-white/40 text-sm tracking-[0.3em] uppercase line-reveal">
                // Advanced Neural Chest X-Ray Analysis
              </p>
              <h1 className="text-white">
                <span className="block text-4xl md:text-7xl font-bold tracking-tight line-reveal">
                  Clarity in Every
                </span>
                <span className="block text-6xl md:text-9xl font-drama italic text-white line-reveal mt-2">
                  Insight.
                </span>
              </h1>
              <div className="mt-8 flex gap-4 pt-9 line-reveal">
                <button
                  onClick={handleCoreClick}
                  className="btn-magnetic px-8 py-4 bg-accent text-black font-bold rounded-full text-sm tracking-widest uppercase hover:scale-105 transition-transform focus:ring-2 focus:ring-accent focus:outline-none"
                >
                  {user ? "Dashboard" : "Begin Analysis"}
                </button>
                <button 
                  onClick={() => window.open("https://www.instagram.com/your_username", "_blank")}
                  className="px-8 py-4 bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-full text-sm tracking-widest uppercase hover:bg-white/35 hover:scale-105 transition-all focus:ring-2 focus:ring-white focus:outline-none"
              >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
