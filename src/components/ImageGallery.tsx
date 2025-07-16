import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group" onClick={() => setIsModalOpen(true)}>
        <img 
          src={images[currentIndex]} 
          alt={alt}
          className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 p-2"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <img
              src={images[currentIndex]}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 p-2"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;