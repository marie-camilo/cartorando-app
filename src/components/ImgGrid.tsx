'use client';
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation du background : adaptée selon mobile/desktop
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
            // Mobile : fenêtre plus large pour garantir la transition
            start: isMobile ? 'top 70%' : 'top 50%',
            end: isMobile ? 'top 20%' : 'top 20%',
            scrub: 3,
            // markers: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [fromColor, toColor, isMobile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cursorRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

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
        onMouseEnter={() => !isMobile && setInside(true)}
        onMouseLeave={() => !isMobile && setInside(false)}
      >
        {images.map((src, index) => (
          <Link
            key={index}
            to="/hikes/list"
            className={isMobile ? 'block' : ''}
          >
            <img
              src={src}
              alt={`img-${index}`}
              className={`
                grid-image w-full object-cover rounded-lg
                ${isMobile
                ? 'h-[300px] sm:h-[400px]'
                : 'h-full'
              }
              `}
              onMouseEnter={() => !isMobile && setHovered(true)}
              onMouseLeave={() => !isMobile && setHovered(false)}
            />
          </Link>
        ))}

        {!isMobile && (
          <div
            ref={cursorRef}
            className={`
              absolute pointer-events-none flex items-center justify-center
              bg-white text-black font-bold text-sm
              rounded-full
              transition-all duration-200 ease-out
              ${hovered ? "w-24 h-24" : inside ? "w-10 h-10" : "w-0 h-0"}
            `}
          >
            {hovered && "SEE!"}
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageGrid;