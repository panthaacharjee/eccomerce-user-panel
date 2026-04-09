// components/ProductCard.tsx
"use client";

import { Product } from "@/redux/interfaces/productInterface";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Get primary image - using schema fields (public_id, url, is_primary)
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

  // Get hover image (second image or first image as fallback)
  const hoverImage = product.images?.[1] || product.images?.[0];

  // Get minimum price for display (if multiple sizes)
  const getMinPrice = () => {
    if (product.sizes && product.sizes.length > 0) {
      const prices = product.sizes.map(size => size.price);
      return Math.min(...prices);
    }
    return product.price;
  };

  // Get maximum price for display (if multiple sizes)
  const getMaxPrice = () => {
    if (product.sizes && product.sizes.length > 0) {
      const prices = product.sizes.map(size => size.price);
      return Math.max(...prices);
    }
    return product.price;
  };

  const minPrice = getMinPrice();
  const maxPrice = getMaxPrice();
  const hasMultiplePrices = minPrice !== maxPrice;

  // Calculate average rating from reviews
  const getAverageRating = () => {
    if (!product.review || product.review.length === 0) return null;

    const total = product.review.reduce((sum, review) => sum + review.rating, 0);
    const average = total / product.review.length;
    return average.toFixed(1);
  };

  const averageRating = getAverageRating();

  // Handle card click to navigate to product detail page
  const handleCardClick = (e: React.MouseEvent) => {
    router.push(`/product/${product._id}`);
  };

  // Format currency based on product currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
      <div
        className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-72 overflow-hidden bg-gray-100">
          {primaryImage ? (
            <img
              src={isHovered && hoverImage ? hoverImage.url : primaryImage.url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <i className="fas fa-image text-4xl text-gray-300"></i>
            </div>
          )}

          {/* Product badges */}
          {product.stock_quantity === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </div>
          )}

          {averageRating && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <i className="fas fa-star text-xs"></i>
              <span>{averageRating}</span>
            </div>
          )}

          {/* Sale badge (if cost_price exists and is less than price) */}
          {product.cost_price && product.cost_price < product.price && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Sale
            </div>
          )}

          {/* Quick view overlay - optional enhancement */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleCardClick}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px]">
            {product.title}
          </h3>

          {/* Categories - single object, not array */}
          {product.categories && product.categories.main_category && (
            <p className="text-xs text-gray-500 mb-2">
              {product.categories.main_category}
              {product.categories.sub_category && (
                <span> / {product.categories.sub_category}</span>
              )}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasMultiplePrices ? (
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(minPrice)}
                  </span>
                  <span className="text-sm text-gray-500"> - </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(maxPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(minPrice)}
                </span>
              )}

              {/* Show original price if on sale */}
              {product.cost_price && product.cost_price < product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.cost_price)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {product.stock_quantity > 0 && product.stock_quantity < 10 && (
              <span className="text-xs text-orange-500 font-medium">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>

          {/* Size information if available */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size.title}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {size.title}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{product.sizes.length - 3}
                </span>
              )}
            </div>
          )}

         
        </div>
      </div>
    </>
  );
};

export default ProductCard;