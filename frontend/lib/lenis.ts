"use client";

import Lenis from "lenis";
import { useEffect, useState } from "react";
import { gsap } from "./gsap";

export function useLenis() {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    setLenis(instance);

    gsap.ticker.add((time) => {
      instance.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      instance.destroy();
      gsap.ticker.remove((time) => {
        instance.raf(time * 1000);
      });
    };
  }, []);

  return lenis;
}
