'use client';
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageParallax } from '../hooks/useParallax';
gsap.registerPlugin(ScrollTrigger);

interface ImageGridProps {
  images: string[];
  fromColor?: string;
  toColor?: string;
}

const ImageGrid: React.FC<ImageGridProps> = ({
                                               images,
                                               fromColor = '#f5f1e8',
                                               toColor = '#000000'
                                             }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [inside, setInside] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cursorInitialized, setCursorInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation du background
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { backgroundColor: fromColor },
        {
          backgroundColor: toColor,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? 'top 70%' : 'top 50%',
            end: isMobile ? 'top 20%' : 'top 20%',
            scrub: 3,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [fromColor, toColor, isMobile]);

  // Gestion du curseur custom
  useEffect(() => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

      // Marquer comme initialisé après le premier mouvement
      if (!cursorInitialized) {
        setCursorInitialized(true);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.set(cursor, {
        x: x,
        y: y,
        xPercent: -50,
        yPercent: -50,
      });

      setCursorInitialized(true);
      setInside(true);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isMobile, cursorInitialized]);

  const parallaxRefs = images.map(() => useImageParallax<HTMLImageElement>({
    speed: 45,
    autoScale: true,
    baseScale: 1.2,
  }));

  return (
    <section
      ref={sectionRef}
      className="min-h-screen text-white pt-0"
      style={{ backgroundColor: fromColor }}
    >
      {/* Espace de respiration */}
      <div className="h-[25vh] md:h-[35vh]" />

      {/* Grid des images */}
      <div
        ref={containerRef}
        className={`
          relative w-full grid gap-3 p-3 overflow-hidden
          ${isMobile
          ? 'grid-cols-1 auto-rows-auto pb-12'
          : 'grid-cols-3 h-screen cursor-none'
        }
        `}
        onMouseLeave={() => {
          if (!isMobile) {
            setInside(false);
            setCursorInitialized(false);
          }
        }}
      >
        {images.map((src, index) => {
          const parallax = parallaxRefs[index];
          return (
            <div
              ref={parallax.containerRef}
              key={index}
              className="relative overflow-hidden rounded-lg"
            >
              <div className="inner-wrapper w-full h-full scale-100 will-change-transform">
                <Link to="/hikes/list" className={isMobile ? 'block' : ''}>
                  <img
                    ref={parallax.imageRef}
                    src={src}
                    alt={`img-${index}`}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
            </div>
          );
        })}

        {!isMobile && (
          <div
            ref={cursorRef}
            className={`
              absolute pointer-events-none flex items-center justify-center
              bg-white text-black font-bold text-sm
              rounded-full
              transition-all duration-200 ease-out
              ${hovered ? "w-24 h-24" : inside && cursorInitialized ? "w-10 h-10" : "w-0 h-0"}
            `}
            style={{
              // Position initiale hors écran si pas encore initialisé
              opacity: cursorInitialized ? 1 : 0,
            }}
          >
            {hovered && "SEE!"}
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageGrid;