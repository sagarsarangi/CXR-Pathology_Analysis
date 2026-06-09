"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { usePageTransition } from "./PageTransition";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const user = useAuthStore((state) => state.user);
  const navRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const { navigateTo } = usePageTransition();
  const pathname = usePathname();

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);

      // Hide navbar on scroll down, show on scroll up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(() => {
    // Existing logic for #features if present, but we keep isHidden controlled by scroll mostly
    const trigger = document.querySelector("#features");
    if (!trigger) return;

    const st = ScrollTrigger.create({
      trigger: "#features",
      start: "top 15%",
      end: "bottom 15%",
      onToggle: (self) => {
        // Only force hide if we are in the features section and NOT scrolling up
        // Actually, the user wants it to hide when scrolling down.
        // Let's keep the scroll direction logic as primary.
      },
    });

    ScrollTrigger.refresh();
    return () => st.kill();
  }, [pathname]);

  useGSAP(() => {
    if (isHidden) {
      gsap.to(outerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
    } else {
      gsap.to(outerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, [isHidden]);

  useGSAP(() => {
    if (scrolled) {
      gsap.to(navRef.current, {
        y: 20,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(16px)",
        padding: "0.5rem 1.5rem",
        borderRadius: "9999px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(navRef.current, {
        y: 0,
        backgroundColor: "transparent",
        backdropFilter: "blur(0px)",
        padding: "1.5rem 2rem",
        borderRadius: "0px",
        border: "1px solid rgba(255, 255, 255, 0)",
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [scrolled]);

  const navLinks = [{ label: "Performance", href: "/performance" }];

  return (
    <div
      ref={outerRef}
      className="fixed top-0 inset-x-0 z-[100] flex justify-center pointer-events-none"
    >
      <nav
        ref={navRef}
        className="flex items-center gap-4 md:gap-8 pointer-events-auto transition-all"
      >
        <button
          onClick={() => navigateTo("/")}
          className="font-mono text-lg md:text-xl tracking-tighter text-white font-bold hover:text-accent transition-colors shrink-0"
        >
          NEURO
        </button>

        <div className="flex items-center gap-3 md:gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => navigateTo(link.href)}
              className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-white hover:text-accent transition-colors whitespace-nowrap"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {user ? (
            <button
              onClick={() => navigateTo("/dashboard")}
              className="px-4 md:px-6 py-2 bg-accent text-black rounded-full text-[8px] md:text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform"
            >
              Interface
            </button>
          ) : (
            <button
              onClick={() => navigateTo("/auth/signin")}
              className="px-4 md:px-6 py-2 bg-accent text-black rounded-full text-[8px] md:text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-transform"
            >
              Init
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
