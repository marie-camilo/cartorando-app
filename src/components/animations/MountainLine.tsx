'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MountainLineProps {
  images: string[];
}

const STACK_CONFIG = [
  {
    SIZE: 180,
    OFFSET_X: -280,
    OFFSET_Y: -10,
    SPREAD: 70,
    ROTATION: 5,
    COUNT: 3,
  },
  {
    SIZE: 280,
    OFFSET_X: 210,
    OFFSET_Y: 190,
    SPREAD: 90,
    ROTATION: 3,
    COUNT: 4,
  },
];

const ACTIVE_STACKS = STACK_CONFIG.slice(0, 2);

const DESKTOP_IMAGE_STYLES = [
  { size: 'w-[540px] h-[620px]', offset: '-translate-y-[250px] -translate-x-[110px]' },
  { size: 'w-[430px] h-[530px]', offset: '-translate-y-[720px] translate-x-[110px]' },
  { size: 'w-[560px] h-[380px]', offset: '-translate-y-[780px] -translate-x-[130px]' },
];

const MOBILE_IMAGE_STYLES = [
  { size: 'w-[280px] h-[320px]', offset: '' },
  { size: 'w-[260px] h-[300px]', offset: '' },
  { size: 'w-[300px] h-[200px]', offset: '' },
];

const MountainLine: React.FC<MountainLineProps> = ({ images }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  /* Responsive */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const imageStyles = isMobile ? MOBILE_IMAGE_STYLES : DESKTOP_IMAGE_STYLES;

  useEffect(() => {
    if (isMobile) return;
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    const anim = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: svgRef.current,
        start: 'top center',
        end: 'bottom bottom',
        scrub: 3,
      },
    });

    return () => { anim.kill(); };
  }, [isMobile]);

  const random = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const desktopPath =
    'M800.014 0.482666L720.514 21.9827L701.514 89.9827L600.514 67.9827L574.014 172.983L486.514 203.983L442.514 293.983L288.514 346.483L170.014 325.483L12.0144 339.983L0.514404 456.983L67.0144 561.483V675.483H188.514L256.014 744.983L352.014 768.483L406.014 874.483L352.014 951.983L424.514 1040.48L574.014 996.483L765.514 1024.48L965.014 996.483';

  return (
    <section className="white-section relative w-full bg-[#F5F3EF] pt-[10vh] pb-[8vh] md:pb-[24vh] overflow-visible z-20">
      {/* SVG */}
      <svg
        ref={svgRef}
        className="hidden md:block absolute inset-0 mx-auto w-[60%] z-0"
        viewBox="0 0 954 1831"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={desktopPath} stroke="#8fa182" strokeWidth="2.5" opacity="0.4" fill="none" />
        <path ref={pathRef} d={desktopPath} stroke="#4c6b48" strokeWidth="2.5" fill="none" />
      </svg>

      {/* Images + Stacks */}
      <div className={`relative z-10 flex flex-col ${isMobile ? 'gap-[5vh]' : 'gap-[25vh]'}`}>
        {images.slice(0, 3).map((src, i) => {
          const style = imageStyles[i % imageStyles.length];
          const stack = ACTIVE_STACKS[i % ACTIVE_STACKS.length];
          const isLastImage = i === 2; // Dernière image

          return (
            <div
              key={i}
              data-image-index={i}
              className={`
        flex relative
        ${isMobile
                ? i % 2 === 0 ? 'justify-start pl-6' : 'justify-end pr-6'
                : i % 2 === 0 ? 'justify-end pl-24' : 'justify-start pr-24'}
        ${isLastImage && !isMobile ? '-mb-[600px]' : ''} 
      `}
            >
              <div className="relative">
                <img
                  src={src}
                  alt=""
                  className={`object-cover rounded-2xl shadow-2xl transition-all duration-500 ${style.size} ${style.offset}`}
                />

                {/* Stack desktop uniquement sur les 2 premières images */}
                {!isMobile && i < 2 && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: `calc(50% + ${stack.OFFSET_Y}px)`,
                      left: `calc(50% + ${stack.OFFSET_X}px)`,
                      transform: 'translate(-50%, -50%)',
                      width: stack.SIZE * 1.5,
                      height: stack.SIZE * 1.5,
                    }}
                  >
                    {[...Array(stack.COUNT)].map((_, s) => {
                      const imgSrc = images[(i + s + 1) % images.length];

                      return (
                        <img
                          key={s}
                          src={imgSrc}
                          className="absolute object-cover rounded-xl shadow-xl opacity-90"
                          style={{
                            width: stack.SIZE,
                            height: stack.SIZE * 1.25,
                            transform: `
                      rotate(${random(-stack.ROTATION, stack.ROTATION)}deg)
                      translate(
                        ${random(-stack.SPREAD, stack.SPREAD)}px,
                        ${random(-stack.SPREAD, stack.SPREAD)}px
                      )
                    `,
                            top: 0,
                            left: 0,
                            transition: '0.4s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MountainLine;
