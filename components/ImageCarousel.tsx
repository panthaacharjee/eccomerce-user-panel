"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
} from "react-icons/fa";

export interface CarouselImage {
  id: number;
  image: string;
  alt: string;
  title?: string;
  description?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  transitionDuration?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showNavigation = true,
  showIndicators = true,
  transitionDuration = 500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;

      setIsTransitioning(true);
      setCurrentIndex(index);

      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    },
    [currentIndex, isTransitioning, transitionDuration]
  );

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goToSlide(nextIndex);
  }, [currentIndex, images.length, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  }, [currentIndex, images.length, goToSlide]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goToPrev();
      if (event.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  return (
    <div className="relative w-full  mx-auto overflow-hidden shadow-2xl group">
      {/* Main Image Container */}
      <div className="relative aspect-video  bg-black">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-all duration-${transitionDuration} ease-in-out transform ${
              index === currentIndex
                ? "opacity-100 translate-x-0"
                : index < currentIndex
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
            style={{ transitionDuration: `${transitionDuration}ms` }}
          >
            <img
              src={image.image}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Image Caption Overlay */}
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {image.title && (
                  <h3 className="text-sm lg:text-2xl font-bold mb-2">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-xs lg:text-lg opacity-90">{image.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {showNavigation && (
        <>
          <button
            onClick={goToPrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className="transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50"
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex ? (
                <FaCircle className="w-3 h-3 text-white animate-pulse" />
              ) : (
                <FaRegCircle className="w-3 h-3 text-white/60 hover:text-white" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageCarousel;
