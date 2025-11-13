'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CircularText from './CircularText';

gsap.registerPlugin(ScrollTrigger);

const CardStacking: React.FC<CardStackingProps> = ({ cards }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

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
    }, sectionRef);

    return () => ctx.revert();
  }, [cards]);

  return (
    <section ref={sectionRef} className="relative overflow-visible bg-gradient-to-br from-stone-50 via-sand-50 to-moss-50">
      <div className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6">
        {/* Container pour les cartes : plus haut que large */}
        <div className="relative w-full max-w-xl h-[800px] mx-auto mt-0">
          {cards.map((card, i) => (
            <div key={card.id} ref={el => (cardRefs.current[i] = el)} className="absolute inset-0">
              {/* CircularText sur la première carte */}
              {i === 0 && (
                <div className="absolute -top-20 -right-20 z-20">
                  <CircularText
                    text="EXPLORE*HIKE*WANDER*DISCOVER*"
                    onHover="speedUp"
                    spinDuration={20}
                    className="w-[200px] h-[200px]"
                    textColor="#ada3b1"
                  />
                </div>
              )}

              {/* Image seule */}
              <div className="w-full h-full overflow-hidden shadow-2xl ">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>



  );
};


export default CardStacking;
