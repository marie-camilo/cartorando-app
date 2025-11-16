'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CircularText from './CircularText';

gsap.registerPlugin(ScrollTrigger);

interface Card {
  id: string | number;
  title: string;
  image: string;
}

interface CardStackingProps {
  cards: Card[];
}

const CardStacking: React.FC<CardStackingProps> = ({ cards }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      // Positions initiales adaptées selon la plateforme
      if (isMobile) {
        gsap.set(cardRefs.current[0], { y: -10, x: 40, rotation: 6, scale: 0.88, opacity: 1, zIndex: 1 });
        gsap.set(cardRefs.current[1], { y: 350, x: -15, rotation: -8, scale: 0.85, opacity: 1, zIndex: 2 });
        gsap.set(cardRefs.current[2], { y: 350, x: 0, rotation: 4, scale: 0.85, opacity: 1, zIndex: 3 });

        gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=2500",
            pin: true,
            scrub: 3,
          },
        })
          .to(cardRefs.current[1], { y: 30, x: -60, rotation: -4, scale: 0.90, ease: "power2.out", duration: 1 })
          .to(cardRefs.current[2], { y: -5, x: 5, rotation: 2, scale: 0.94, ease: "power2.out", duration: 1 }, "+=0.2");
      } else {
        gsap.set(cardRefs.current[0], { y: -20, x: 120, rotation: 8, scale: 0.85, opacity: 1, zIndex: 1 });
        gsap.set(cardRefs.current[1], { y: 700, x: -30, rotation: -10, scale: 0.8, opacity: 1, zIndex: 2 });
        gsap.set(cardRefs.current[2], { y: 700, x: 0, rotation: 5, scale: 0.8, opacity: 1, zIndex: 3 });

        gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 3,
          },
        })
          .to(cardRefs.current[1], { y: 50, x: -180, rotation: -5, scale: 0.87, ease: "power2.out", duration: 1 })
          .to(cardRefs.current[2], { y: -5, x: 10, rotation: 2, scale: 0.92, ease: "power2.out", duration: 1 }, "+=0.2");
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [cards, isMobile]);

  return (
    <section ref={sectionRef} className="relative overflow-visible bg-gradient-to-br from-stone-50 via-sand-50 to-moss-50 white-section">
      <div className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6">
        <div className={`relative w-full mx-auto mt-0 ${isMobile ? 'max-w-[280px] h-[500px]' : 'max-w-xl h-[800px]'}`}>
          {cards.map((card: Card, i: number) => (
            <div
              key={card.id}
              ref={el => { cardRefs.current[i] = el; }}
              className="absolute inset-0"
            >
              {i === 0 && (
                <div className={`absolute z-20 ${isMobile ? '-top-12 -right-12' : '-top-20 -right-20'}`}>
                  <CircularText
                    text="EXPLORE*HIKE*WANDER*DISCOVER*"
                    onHover="speedUp"
                    spinDuration={20}
                    className={isMobile ? 'w-[140px] h-[140px]' : 'w-[200px] h-[200px]'}
                    textColor="#ada3b1"
                  />
                </div>
              )}

              <div className="w-full h-full overflow-hidden shadow-2xl rounded-lg">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardStacking;
