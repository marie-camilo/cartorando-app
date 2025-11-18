import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxOptions {
  speed?: number; // Vitesse du parallax en % (déplacement total)
  autoScale?: boolean; // Auto calc du scale pour remplir le container
  baseScale?: number; // Scale minimal si autoScale OFF
}

export const useImageParallax = <T extends HTMLElement>(
  options: ParallaxOptions = {}
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<T>(null);

  const {
    speed = 30,
    autoScale = true,
    baseScale = 1.2,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    // ---- CALCUL DU SCALE AUTO POUR IMAGE ----
    let finalScale = baseScale;
    if (autoScale) {
      const containerHeight = container.offsetHeight;
      const halfSpeed = speed / 2;
      const moveDistance = containerHeight * (halfSpeed / 100);
      const requiredHeight = containerHeight + moveDistance * 2;
      finalScale = Math.max(baseScale, requiredHeight / containerHeight);
    }

    gsap.set(image, {
      scale: finalScale,
      yPercent: -speed / 2,
      willChange: "transform",
    });

    // ---- ANIMATION PARALLAX IMAGE ----
    const imageAnimation = gsap.to(image, {
      yPercent: speed / 2,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });

    const containerAnimation = gsap.fromTo(
      container.querySelector('.inner-wrapper'),
      { scale: 1 },
      {
        scale: 1.05, // zoom visible
        ease: "power1.out",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5, // ultra fluide
        },
      }
    );

    return () => {
      imageAnimation.kill();
      containerAnimation.kill();
    };
  }, [speed, autoScale, baseScale]);

  return { containerRef, imageRef };
};
