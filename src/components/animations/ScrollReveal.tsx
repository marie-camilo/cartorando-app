'use client';
import React, { useEffect, useRef, useMemo, ReactNode, RefObject, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
                                                     children,
                                                     scrollContainerRef,
                                                     enableBlur = true,
                                                     baseOpacity = 0.1,
                                                     baseRotation = 3,
                                                     blurStrength = 4,
                                                     containerClassName = '',
                                                     textClassName = '',
                                                     rotationEnd = 'bottom bottom',
                                                     wordAnimationEnd = 'bottom bottom'
                                                   }) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pinTarget = el.parentElement;
    const scroller = scrollContainerRef?.current ?? window;

    // Pin plus court sur mobile
    ScrollTrigger.create({
      trigger: pinTarget,
      start: "top top",
      end: isMobile ? "bottom+=80% top" : "bottom+=120% top",
      pin: pinTarget,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1
    });

    // Rotation désactivée sur mobile pour plus de lisibilité
    if (!isMobile) {
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 95%',
            end: 'bottom -50%',
            scrub: true
          }
        }
      );
    }

    const wordElements = el.querySelectorAll<HTMLElement>('.word');

    // Animation d'opacité adaptée
    gsap.fromTo(
      wordElements,
      { opacity: baseOpacity },
      {
        opacity: 1,
        ease: 'none',
        stagger: isMobile ? 0.03 : 0.05, // Stagger plus rapide sur mobile
        scrollTrigger: {
          trigger: el,
          scroller,
          start: isMobile ? 'top 90%' : 'top 100%',
          end: isMobile ? 'bottom -20%' : 'bottom -60%',
          scrub: true
        }
      }
    );

    // Blur adapté pour mobile
    if (enableBlur) {
      gsap.fromTo(
        wordElements,
        { filter: `blur(${isMobile ? blurStrength * 0.6 : blurStrength}px)` }, // Moins de blur sur mobile
        {
          filter: 'blur(0px)',
          ease: 'none',
          stagger: isMobile ? 0.03 : 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: isMobile ? 'top 85%' : 'top bottom-=20%',
            end: wordAnimationEnd,
            scrub: true
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isMobile, enableBlur, baseOpacity, baseRotation, blurStrength, wordAnimationEnd, scrollContainerRef]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p className={` 
        font-bold 
        uppercase 
        tracking-tight 
        leading-[0.9] 
        ${isMobile
        ? 'text-[clamp(2rem,8vw,4rem)]'      
        : 'text-[clamp(3rem,10vw,8rem)]'     
      }
        ${textClassName}
      `}
      >
        {splitText}
      </p>
    </h2>
  );
};

export default ScrollReveal;