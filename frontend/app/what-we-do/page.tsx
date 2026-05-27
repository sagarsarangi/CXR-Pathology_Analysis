"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function WhatWeDo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(".fade-in", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5 }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Data architecture"
            fill
            className="object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary" />
        </div>
        
        <div className="relative z-10 text-center space-y-6 max-w-4xl px-8">
          <p className="font-mono text-accent text-sm tracking-[0.5em] uppercase fade-in">
            // Our Methodology
          </p>
          <h1 className="text-white text-5xl md:text-8xl font-bold tracking-tight fade-in">
            We architect the <span className="font-drama italic text-white underline decoration-white/20">Neural Future.</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto fade-in">
            Our approach blends deep-learning resonance with distributed intelligence to create systems that don't just process data—they understand intent.
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 px-8 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Ingestion",
              desc: "Deep mapping of multi-modal data structures across your entire ecosystem.",
              icon: "01"
            },
            {
              title: "Resonance",
              desc: "Neural synchronization where patterns emerge from noise through recursive inference.",
              icon: "02"
            },
            {
              title: "Syndication",
              desc: "Zero-latency deployment of synthesized intelligence to every edge node.",
              icon: "03"
            }
          ].map((item, i) => (
            <div key={i} className="space-y-6 p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/20 transition-colors group">
              <span className="font-mono text-white text-4xl font-bold opacity-10 group-hover:opacity-40 transition-opacity">{item.icon}</span>
              <h3 className="text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Visual */}
      <section className="py-20 flex justify-center">
         <div className="h-px w-32 bg-accent opacity-30" />
      </section>
    </div>
  );
}
