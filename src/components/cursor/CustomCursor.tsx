import React, { useEffect, useState } from "react";

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Gestion hover sur toutes les images
  useEffect(() => {
    const imgs = document.querySelectorAll("img");
    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    imgs.forEach((img) => {
      img.addEventListener("mouseenter", handleMouseEnter);
      img.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("mouseenter", handleMouseEnter);
        img.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <div
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      className={`
        fixed pointer-events-none z-50 flex items-center justify-center
        bg-white text-black font-bold text-sm
        rounded-full
        transition-all duration-200 ease-out
        ${hovered ? "w-24 h-24" : "w-10 h-10"}
      `}
    >
      {hovered && "SEE!"}
    </div>
  );
};

export default CustomCursor;
