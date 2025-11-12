'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export interface HikeCardType {
  id: number;
  title: string;
  location: string;
  difficulty: 'Facile' | 'Modéré' | 'Expert';
  duration: string;
  elevation: string;
  image: string;
  color: string;
}

interface CardStackingProps {
  cards: HikeCardType[];
}

const CardStacking: React.FC<CardStackingProps> = ({ cards }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      gsap.set(sectionRef.current, { height: "100vh" });

      gsap.set(cardRefs.current[0], { y: 0, x: 60, rotation: 8, scale: 0.85, opacity: 1, zIndex: 1 });
      gsap.set(cardRefs.current[1], { y: 600, x: -40, rotation: -10, scale: 0.8, opacity: 1, zIndex: 2 });
      gsap.set(cardRefs.current[2], { y: 600, x: 0, rotation: 5, scale: 0.8, opacity: 1, zIndex: 3 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3000",
          pin: true,
          scrub: 3,
        },
      });

      tl.to(cardRefs.current[1], {
        y: -20,
        x: -25,
        rotation: -5,
        scale: 0.87,
        ease: "power2.out",
        duration: 1,
      })
        .to(
          cardRefs.current[2],
          {
            y: -80,
            x: 10,
            rotation: 3,
            scale: 0.92,
            ease: "power2.out",
            duration: 1,
          },
          "+=0.2"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [cards]);

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile':
        return { color: '#7A9B76', bg: 'bg-emerald-50', text: 'text-emerald-700' };
      case 'Modéré':
        return { color: '#E8A87C', bg: 'bg-amber-50', text: 'text-amber-700' };
      case 'Expert':
        return { color: '#C85A54', bg: 'bg-red-50', text: 'text-red-700' };
      default:
        return { color: '#8BB4C9', bg: 'bg-slate-50', text: 'text-slate-700' };
    }
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-sand-50 to-moss-50">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        {/* En-tête moderne */}
        <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 text-center z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-dark mb-2 tracking-tight">
            Sentiers Populaires
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">Découvrez nos randonnées favorites</p>
        </div>

        <div className="relative w-full max-w-md h-[600px] mx-auto mt-32 sm:mt-40">
          {cards.map((card, i) => {
            const diffConfig = getDifficultyConfig(card.difficulty);

            return (
              <div key={card.id} ref={el => cardRefs.current[i] = el} className="absolute inset-0">
                <div className="group relative bg-white rounded-3xl shadow-2xl h-full flex flex-col overflow-hidden border border-slate-100 hover:border-sage-200 transition-all duration-500 hover:shadow-sage-200/20 hover:shadow-3xl">
                  {/* Image avec overlay gradient moderne */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-forest-dark/30 to-transparent"/>

                    {/* Badge difficulté modernisé */}
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-xl shadow-lg border ${diffConfig.bg} ${diffConfig.text} border-white/20`}>
                      {card.difficulty}
                    </div>

                    {/* Titre superposé sur l'image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-lg leading-tight">
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90">
                        <MapPin className="w-4 h-4"/>
                        <span className="text-sm drop-shadow">{card.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-stone-50">
                    {/* Stats avec design moderne */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-sky-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-200/50">
                          <Clock className="w-5 h-5 text-white"/>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-0.5">Durée</p>
                          <p className="text-sm font-bold text-slate-900">{card.duration}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-sage-200 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center shadow-lg shadow-sage-200/50">
                          <TrendingUp className="w-5 h-5 text-white"/>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-0.5">Dénivelé</p>
                          <p className="text-sm font-bold text-slate-900">{card.elevation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bouton CTA modernisé */}
                    <button
                      className="relative w-full mt-5 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl overflow-hidden group/btn"
                      style={{ backgroundColor: diffConfig.color }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Découvrir le sentier
                        <ArrowUpRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CardStacking;