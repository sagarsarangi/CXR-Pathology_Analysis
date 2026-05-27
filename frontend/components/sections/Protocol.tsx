"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const PROTOCOLS = [
  {
    num: "01",
    title: "Synaptic Ingestion",
    description: "Map your existing data architecture into a high-dimensional neural vector space. We don't just store; we understand structure.",
    animation: "motif",
  },
  {
    num: "02",
    title: "Quantum Synthesis",
    description: "Apply massive-scale recursive inference to identify cross-domain patterns. Turn raw signal into actionable intelligence.",
    animation: "waveform",
  },
  {
    num: "03",
    title: "Syndicated Action",
    description: "Deploy insights across your entire stack with zero-latency neural bridging. Real results, delivered where you work.",
    animation: "laser",
  },
];

export default function Protocol() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const cards = gsap.utils.toArray<HTMLElement>(".protocol-card");

    mm.add("(prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            pin: true,
            pinSpacing: false,
            end: () => `+=${window.innerHeight * 0.5}`,
          });

          if (i < cards.length - 1) {
            gsap.to(card, {
              scale: 0.9,
              filter: "blur(20px)",
              opacity: 0.5,
              ease: "none",
              scrollTrigger: {
                trigger: cards[i + 1],
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
          }
        });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
        // Just stack normally without scaling/blurring
    });
  }, { scope: containerRef });

  return (
    <div id="protocol" ref={containerRef} className="relative bg-black">
      {PROTOCOLS.map((protocol, i) => (
        <section
          key={i}
          className="protocol-card relative h-screen w-full flex items-center justify-center p-8 md:p-20 overflow-hidden bg-primary"
        >
          <div className="absolute inset-0 z-0 opacity-40 flex items-center justify-center">
            {protocol.animation === "motif" && <MotifAnimation />}
            {protocol.animation === "waveform" && <WaveformAnimation />}
            {protocol.animation === "laser" && <LaserAnimation />}
          </div>

          <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div
              className={cn(
                "space-y-6",
                i % 2 !== 0 && "md:col-start-2 md:pl-12",
              )}
            >
              <span className="font-mono text-accent text-lg font-bold tracking-widest">
                {protocol.num} //
              </span>
              <h3 className="font-sans text-4xl md:text-6xl font-bold text-white tracking-tight">
                {protocol.title}
              </h3>
              <p className="font-sans text-lg text-white/60 leading-relaxed max-w-md">
                {protocol.description}
              </p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function MotifAnimation() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    gsap.to(ref.current, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none",
    });
  });

  return (
    <svg ref={ref} width="600" height="600" viewBox="0 0 100 100" className="text-accent/30">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.2" />
      {[...Array(12)].map((_, i) => (
        <rect
          key={i}
          x="48"
          y="0"
          width="4"
          height="10"
          fill="currentColor"
          transform={`rotate(${i * 30} 50 50)`}
          className="opacity-50"
        />
      ))}
    </svg>
  );
}

function LaserAnimation() {
  const lineRef = useRef<SVGLineElement>(null);
  const [cells, setCells] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const newCells = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        newCells.push({ x: x * 10, y: y * 10 });
      }
    }
    setCells(newCells);
  }, []);

  useGSAP(() => {
    gsap.to(lineRef.current, {
      attr: { y1: 100, y2: 100 },
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
  });

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="text-accent/10">
      <defs>
        <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Grid */}
      <g>
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width="0.5"
            height="0.5"
            fill="currentColor"
            opacity={Math.random() * 0.5 + 0.2}
          />
        ))}
      </g>

      {/* Scanning Bar */}
      <rect
        ref={lineRef}
        x="0"
        y="0"
        width="100"
        height="15"
        fill="url(#scanGradient)"
        className="text-accent/40"
      />
      
      {/* Laser Core */}
      <line
        ref={lineRef}
        x1="0"
        y1="0"
        x2="100"
        y2="0"
        stroke="white"
        strokeWidth="0.5"
        className="opacity-50"
      />
    </svg>
  );
}

function WaveformAnimation() {
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);

  useGSAP(() => {
    pathsRef.current.forEach((path, i) => {
      if (!path) return;
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 3 + i,
        repeat: -1,
        ease: "none",
        delay: i * 0.5,
      });
    });
  });

  const generatePath = (offset: number) => {
    let d = "M0 100 ";
    for (let x = 0; x <= 800; x += 50) {
      const y = 100 + Math.sin((x + offset) * 0.02) * 40;
      d += `L${x} ${y} `;
    }
    return d;
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" className="text-accent/30 scale-150">
      {[...Array(3)].map((_, i) => (
        <path
          key={i}
          ref={(el) => { pathsRef.current[i] = el; }}
          d={generatePath(i * 100)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1 + i}
          strokeDasharray="2000"
          strokeDashoffset="2000"
          opacity={0.8 - i * 0.2}
        />
      ))}
    </svg>
  );
}
