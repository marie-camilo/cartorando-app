'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BackgroundTransition from "./BackgroundTransition";

gsap.registerPlugin(ScrollTrigger);

interface MountainLineProps {
  images: string[];
}

const MountainLine: React.FC<MountainLineProps> = ({ images }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Style pour chaque image
  const imageStyles = [
    { size: 'w-[540px] h-[620px]', yOffset: '-translate-y-[250px] -translate-x-[110px]' },
    { size: 'w-[430px] h-[530px]', yOffset: '-translate-y-[720px] translate-x-[110px]' },
    { size: 'w-[560px] h-[380px]', yOffset: '-translate-y-[780px] -translate-x-[130px]' },
    { size: 'w-[450px] h-[550px]', yOffset: '-translate-y-[450px] translate-x-[260px]' },
  ];

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: svgRef.current,
        start: "top center",
        end: "bottom bottom",
        scrub: 3,
      },
    });
  }, []);

  return (
    <section className="relative w-full bg-sand py-[5vh] overflow-visible mt-[15vh]">
      <svg
        ref={svgRef}
        className="absolute inset-0 mx-auto w-[60%] h-auto z-0"
        viewBox="0 0 954 1831"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* PATH BASIQUE */}
        <path
          d="M788.5 0.482666L709 21.9827L690 89.9827L589 67.9827L562.5 172.983L475 203.983L431 293.983L263 339.983H0.5V455.983L55.5 561.483V675.483H177L244.5 744.983L340.5 768.483L394.5 874.483L340.5 951.983L413 1040.48L562.5 996.483H953.5V1365.98L868 1393.48L755 1436.48L727.5 1524.98L666.5 1547.48L617.5 1601.98L666.5 1692.48L562.5 1725.98L431 1830.48H113.5"
          stroke="#8fa182"
          strokeWidth="2.5"
          opacity="0.4"
          fill="none"
        />

        {/* PATH ANIMÉ */}
        <path
          ref={pathRef}
          d="M788.5 0.482666L709 21.9827L690 89.9827L589 67.9827L562.5 172.983L475 203.983L431 293.983L263 339.983H0.5V455.983L55.5 561.483V675.483H177L244.5 744.983L340.5 768.483L394.5 874.483L340.5 951.983L413 1040.48L562.5 996.483H953.5V1365.98L868 1393.48L755 1436.48L727.5 1524.98L666.5 1547.48L617.5 1601.98L666.5 1692.48L562.5 1725.98L431 1830.48H113.5"
          stroke="#4c6b48"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>


      {/* IMAGES */}
      <div className="relative z-10 flex flex-col gap-[30vh]">
        {images.slice(0, 5).map((src, i) => {
          const style = imageStyles[i] || imageStyles[0];

          return (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? 'justify-end pl-24' : 'justify-start pr-24'
              }`}
            >
              <img
                src={src}
                alt={`randonnée ${i + 1}`}
                className={`
                  object-cover rounded-2xl shadow-2xl
                  ${style.size} 
                  ${style.yOffset}
                `}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MountainLine;
