// components/SafeImage.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface SafeImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    sizes?: string;
    priority?: boolean;
    fallbackSrc?: string; // Optional custom fallback image
}

const SafeImage: React.FC<SafeImageProps> = ({
    src,
    alt,
    fill,
    className,
    sizes,
    priority,
    fallbackSrc = "/images/fallback-image.jpg", // Default fallback
}) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset state when src changes
    useEffect(() => {
        setImgSrc(src);
        setError(false);
        setIsLoading(true);
    }, [src]);

    // Handle image load error
    const handleError = () => {
        setError(true);
        setIsLoading(false);
        if (fallbackSrc) {
            setImgSrc(fallbackSrc);
        }
    };

    // Handle successful load
    const handleLoad = () => {
        setIsLoading(false);
    };

    // Check if it's an external image
    const isExternal = src.startsWith('http');

    // If it's an external image and not in error state, use img tag
    if (isExternal && !error) {
        return (
            <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imgSrc}
                    alt={alt}
                    className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
                    onError={handleError}
                    onLoad={handleLoad}
                    style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
            </div>
        );
    }

    // For internal images or fallback, use Next.js Image
    return (
        <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
            <Image
                src={error ? fallbackSrc : imgSrc}
                alt={alt}
                fill={fill}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                sizes={sizes}
                priority={priority}
                onError={handleError}
                onLoad={handleLoad}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
};

export default SafeImage;