import React from "react";

interface ImageGridProps {
  images: string[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="w-screen h-screen grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`img-${index}`}
          className="w-full h-full object-cover rounded-lg"
        />
      ))}
    </div>
  );
};

export default ImageGrid;
