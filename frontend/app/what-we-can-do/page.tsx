"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function WhatWeCanDo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".fade-up", 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.4 }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full flex items-end pb-20 px-8 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
            alt="Cybernetic capabilities"
            fill
            className="object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
        </div>
        
        <div className="relative z-10 space-y-4 max-w-5xl">
          <p className="font-mono text-white text-sm tracking-[0.5em] uppercase fade-up opacity-40">
            // Capabilities & Impact
          </p>
          <h1 className="text-white text-6xl md:text-9xl font-bold tracking-tighter leading-none fade-up">
            Powering the <br />
            <span className="font-drama italic text-white underline decoration-white/20">Unimaginable.</span>
          </h1>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-32 px-8 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Neural Search", val: "0.01ms", desc: "Instant semantic retrieval across trillion-parameter datasets." },
            { label: "Auto-Syndication", val: "100%", desc: "Autonomous content distribution and adaptation for every platform." },
            { label: "Pattern Discovery", val: "8.4x", desc: "Acceleration in identifying non-linear correlation in unstructured streams." },
            { label: "Zero-Latency", val: "∞", desc: "Distributed edge processing with near-zero propagation delay." }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-10 rounded-[2.5rem] space-y-6 fade-up">
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{stat.label}</p>
                <p className="text-5xl font-bold text-white tracking-tighter">{stat.val}</p>
              </div>
              <p className="text-sm text-white/20 leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Capabilities List */}
      <section className="py-32 px-8 md:px-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-24">
            {[
                { title: "Synthetic Intelligence Syndication", text: "We enable brands to generate high-fidelity content once and syndicate it across infinite digital touchpoints using neural resonance mapping." },
                { title: "Distributed Neural Mesh", text: "Our decentralized architecture ensures that intelligence is processed at the edge, reducing bandwidth by 90% while maintaining absolute security." }
            ].map((detail, i) => (
                <div key={i} className="space-y-8 fade-up text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        {detail.title}
                    </h2>
                    <p className="text-xl text-white/60 leading-relaxed font-light">
                        {detail.text}
                    </p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}
