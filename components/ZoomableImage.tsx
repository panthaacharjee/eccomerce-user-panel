// components/Product/ZoomableImage.tsx
import { useState, useRef, useEffect } from 'react';

interface ZoomableImageProps {
    src: string;
    alt: string;
    zoomScale?: number;
    className?: string;
    enableDoubleClick?: boolean;
}

export default function ZoomableImage({
    src,
    alt,
    zoomScale = 2,
    className = "",
    enableDoubleClick = true
}: ZoomableImageProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragPosition, setDragPosition] = useState({ x: 50, y: 50 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const touchRef = useRef<any>(null);

    // Handle mouse enter/leave
    const handleMouseEnter = () => {
        if (!isDragging) {
            setIsZoomed(true);
        }
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
        setIsDragging(false);
        setPosition({ x: 50, y: 50 });
    };

    // Handle mouse move for zoom positioning
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || isDragging || !containerRef.current) return;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();

        // Calculate mouse position as percentage
        let x = ((e.clientX - left) / width) * 100;
        let y = ((e.clientY - top) / height) * 100;

        // Constrain to image boundaries
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        setPosition({ x, y });
    };

    // Handle mouse down for drag functionality when zoomed
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;

        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
        setDragPosition(position);
    };

    // Handle mouse move for dragging
    const handleDragMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();

        const deltaX = ((e.clientX - dragStart.x) / width) * 100;
        const deltaY = ((e.clientY - dragStart.y) / height) * 100;

        let newX = dragPosition.x - deltaX;
        let newY = dragPosition.y - deltaY;

        // Constrain to image boundaries with zoom scale
        const maxOffset = 50 * (1 - 1 / zoomScale);
        newX = Math.max(50 - maxOffset, Math.min(50 + maxOffset, newX));
        newY = Math.max(50 - maxOffset, Math.min(50 + maxOffset, newY));

        setPosition({ x: newX, y: newY });
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Handle double click to toggle zoom
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enableDoubleClick) return;

        e.preventDefault();

        if (!isZoomed) {
            // Calculate position for double click
            if (containerRef.current) {
                const { left, top, width, height } = containerRef.current.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                setPosition({ x, y });
            }
        }

        setIsZoomed(!isZoomed);
    };

    // Handle wheel zoom
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.deltaY < 0 && !isZoomed) {
            // Scroll up - zoom in at cursor position
            if (containerRef.current) {
                const { left, top, width, height } = containerRef.current.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                setPosition({ x, y });
            }
            setIsZoomed(true);
        } else if (e.deltaY > 0 && isZoomed) {
            // Scroll down - zoom out
            setIsZoomed(false);
        }
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2) {
            // Pinch to zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            touchRef.current = {
                distance,
                zoomed: isZoomed
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2 && touchRef.current) {
            e.preventDefault();

            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (distance > touchRef.current.distance + 10 && !touchRef.current.zoomed) {
                // Pinch out - zoom in
                if (containerRef.current) {
                    const centerX = (touch1.clientX + touch2.clientX) / 2;
                    const centerY = (touch1.clientY + touch2.clientY) / 2;
                    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
                    const x = ((centerX - left) / width) * 100;
                    const y = ((centerY - top) / height) * 100;
                    setPosition({ x, y });
                }
                setIsZoomed(true);
                touchRef.current.zoomed = true;
            } else if (distance < touchRef.current.distance - 10 && touchRef.current.zoomed) {
                // Pinch in - zoom out
                setIsZoomed(false);
                touchRef.current.zoomed = false;
            }

            touchRef.current.distance = distance;
        }
    };

    const handleTouchEnd = () => {
        touchRef.current = null;
    };

    // Add and remove global event listeners for drag
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragPosition, dragStart]);

    return (
        <div className="relative w-full h-full">
            {/* Image Container */}
            <div
                ref={containerRef}
                className={`relative w-full h-full overflow-hidden cursor-${isZoomed ? 'grabbing' : 'zoom-in'} select-none ${className}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-transform duration-200 ease-out will-change-transform ${isZoomed ? 'scale-250' : 'scale-100'
                        } ${isDragging ? 'transition-none' : ''}`}
                    style={{
                        transformOrigin: `${position.x}% ${position.y}%`,
                    }}
                    draggable="false"
                />

                {/* Zoom Indicator */}
                {isZoomed && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm pointer-events-none backdrop-blur-sm">
                        {Math.round(zoomScale * 100)}%
                    </div>
                )}

                {/* Drag Instruction */}
                {isZoomed && !isDragging && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-30 text-white px-3 py-1 rounded-full text-xs pointer-events-none backdrop-blur-sm">
                        Drag to move
                    </div>
                )}
            </div>

            {/* Zoom Controls (Optional) */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                {!isZoomed && (
                    <div className="bg-black bg-opacity-30 text-white p-2 rounded-full pointer-events-none backdrop-blur-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                        </svg>
                    </div>
                )}
                {isZoomed && (
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all backdrop-blur-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10l-4 4m0 0l4 4m-4-4h8"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}