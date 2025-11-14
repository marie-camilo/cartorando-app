'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BackgroundTransitionProps {
  fromColor: string; // couleur initiale
  toColor: string;   // couleur finale
  start?: string;    // position de départ (ex: "top center")
  end?: string;      // position de fin (ex: "bottom top")
}

const BackgroundTransition: React.FC<BackgroundTransitionProps> = ({
                                                                     fromColor,
                                                                     toColor,
                                                                     start = "top center",
                                                                     end = "bottom center",
                                                                   }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { backgroundColor: fromColor },
      {
        backgroundColor: toColor,
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub: true, // animation fluide au scroll
        },
      }
    );
  }, [fromColor, toColor, start, end]);

  return <div ref={ref} className="w-full h-[180vh]" />;
};

export default BackgroundTransition;
