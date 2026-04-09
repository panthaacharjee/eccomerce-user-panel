// components/ProductGrid.tsx
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Product, SortOption } from "@/redux/interfaces/productInterface";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [sortOption, setSortOption] = useState<SortOption>("title-asc");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sizeSearch, setSizeSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);

  const sizeDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Get unique product types from categories (now a single object, not array)
  const productTypes = useMemo(() => {
    const types = products
      .map((product) => product.categories.main_category)
      .filter(Boolean); // Remove undefined/null values
    return [...new Set(types)];
  }, [products]);

  // Get unique sub-categories for more specific filtering (optional)
  const subCategories = useMemo(() => {
    const subTypes = products
      .map((product) => product.categories.sub_category)
      .filter(Boolean);
    return [...new Set(subTypes)];
  }, [products]);

  // Get unique sizes from product sizes array (using 'title' field)
  const allSizes = useMemo(() => {
    const sizes = products.flatMap((product) =>
      product.sizes.map((size) => size.title)
    );
    return [...new Set(sizes)];
  }, [products]);

  // Filter sizes based on search
  const filteredSizes = useMemo(() => {
    if (!sizeSearch.trim()) return allSizes;
    return allSizes.filter((size) =>
      size.toLowerCase().includes(sizeSearch.toLowerCase()),
    );
  }, [allSizes, sizeSearch]);

  // Filter types based on search
  const filteredTypes = useMemo(() => {
    if (!typeSearch.trim()) return productTypes;
    return productTypes.filter((type) =>
      type.toLowerCase().includes(typeSearch.toLowerCase()),
    );
  }, [productTypes, typeSearch]);

  // Calculate min and max price from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };

    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by product types (main_category)
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedTypes.includes(product.categories.main_category)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max,
    );

    // Filter by sizes (using 'title' field)
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => selectedSizes.includes(size.title))
      );
    }

    // Sort products
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "size-asc": {
          // Since there's no is_default in schema, use first size or empty string
          const aSize = a.sizes[0]?.title || "";
          const bSize = b.sizes[0]?.title || "";
          return aSize.localeCompare(bSize);
        }
        case "size-desc": {
          const aSize = a.sizes[0]?.title || "";
          const bSize = b.sizes[0]?.title || "";
          return bSize.localeCompare(aSize);
        }
        default:
          return 0;
      }
    });
  }, [products, sortOption, selectedTypes, priceRange, selectedSizes]);

  // Initialize price range with bounds
  useEffect(() => {
    if (priceBounds.min !== undefined && priceBounds.max !== undefined) {
      setPriceRange({ min: priceBounds.min, max: priceBounds.max });
    }
  }, [priceBounds]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / productsPerPage,
  );

  // Handle size selection
  const handleSizeToggle = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
    setCurrentPage(1);
  }, []);

  // Handle type selection
  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setCurrentPage(1);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedTypes([]);
    setSortOption("title-asc");
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
    setSelectedSizes([]);
    setIsSizeDropdownOpen(false);
    setIsPriceDropdownOpen(false);
    setIsTypeDropdownOpen(false);
    setIsSortDropdownOpen(false);
    setSizeSearch("");
    setTypeSearch("");
    setCurrentPage(1);
  }, [priceBounds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targets = [
        { ref: sizeDropdownRef, state: setIsSizeDropdownOpen },
        { ref: priceDropdownRef, state: setIsPriceDropdownOpen },
        { ref: typeDropdownRef, state: setIsTypeDropdownOpen },
        { ref: sortDropdownRef, state: setIsSortDropdownOpen },
      ];

      targets.forEach(({ ref, state }) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          state(false);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get sort option display text
  const getSortDisplayText = () => {
    switch (sortOption) {
      case "title-asc":
        return "Title (A-Z)";
      case "title-desc":
        return "Title (Z-A)";
      case "price-asc":
        return "Price (Low to High)";
      case "price-desc":
        return "Price (High to Low)";
      case "size-asc":
        return "Size (Small to Large)";
      case "size-desc":
        return "Size (Large to Small)";
      default:
        return "Sort by";
    }
  };

  // Pagination controls
  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Handle add to cart
  const handleAddToCart = useCallback((product: Product) => {
    console.log("Add to cart:", product);
    // Implement your add to cart logic here
  }, []);

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-gray-300 text-6xl mb-4">
          <i className="fas fa-box-open"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No products available
        </h3>
        <p className="text-gray-500">Check back later for new products</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        {/* First Row: Filters and Sort Options */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left side: 3 Filters */}
          <div className="w-full md:w-8/12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div ref={typeDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-left bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 flex justify-between items-center"
                >
                  <span className="text-gray-800">
                    {selectedTypes.length === 0
                      ? "All Categories"
                      : `${selectedTypes.length} category${selectedTypes.length > 1 ? "s" : ""} selected`}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isTypeDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isTypeDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <input
                          type="text"
                          value={typeSearch}
                          onChange={(e) => setTypeSearch(e.target.value)}
                          placeholder="Search categories..."
                          className="w-full border border-gray-300 rounded px-3 py-2 pl-9 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
                        />
                        <svg
                          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-46">
                      {filteredTypes.length > 0 ? (
                        <div className="p-2">
                          {filteredTypes.map((type) => (
                            <label
                              key={type}
                              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTypes.includes(type)}
                                onChange={() => handleTypeToggle(type)}
                                className="h-4 w-4 text-gray-700 rounded border-gray-300 focus:ring-gray-400 mr-3"
                              />
                              <span className="text-sm text-gray-700">
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Size Filter */}
              {allSizes.length > 0 && (
                <div ref={sizeDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
                    className="w-full border border-gray-300 rounded px-4 py-2.5 text-left bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 flex justify-between items-center"
                  >
                    <span className="text-gray-800">
                      {selectedSizes.length === 0
                        ? "All Sizes"
                        : `${selectedSizes.length} size${selectedSizes.length > 1 ? "s" : ""} selected`}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isSizeDropdownOpen ? "transform rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isSizeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={sizeSearch}
                            onChange={(e) => setSizeSearch(e.target.value)}
                            placeholder="Search sizes..."
                            className="w-full border border-gray-300 rounded px-3 py-2 pl-9 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
                          />
                          <svg
                            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-46">
                        {filteredSizes.length > 0 ? (
                          <div className="p-2">
                            {filteredSizes.map((size) => (
                              <label
                                key={size}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSizes.includes(size)}
                                  onChange={() => handleSizeToggle(size)}
                                  className="h-4 w-4 text-gray-700 rounded border-gray-300 focus:ring-gray-400 mr-3"
                                />
                                <span className="text-sm text-gray-700">
                                  {size}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No sizes found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sort Options */}
              <div ref={sortDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-left bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 flex justify-between items-center"
                >
                  <span className="text-gray-800">{getSortDisplayText()}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isSortDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg py-2">
                    {[
                      { value: "title-asc", label: "Title (A-Z)" },
                      { value: "title-desc", label: "Title (Z-A)" },
                      { value: "price-asc", label: "Price (Low to High)" },
                      { value: "price-desc", label: "Price (High to Low)" },
                      { value: "size-asc", label: "Size (Small to Large)" },
                      { value: "size-desc", label: "Size (Large to Small)" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortOption(option.value as SortOption);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortOption === option.value
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-700"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Price Range Filter */}
          <div ref={priceDropdownRef} className="w-full md:w-4/12">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <button
              type="button"
              onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-left bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 flex justify-between items-center"
            >
              <span className="text-gray-800">
                {priceRange.min === priceBounds.min &&
                  priceRange.max === priceBounds.max
                  ? "All Prices"
                  : `$${priceRange.min} - $${priceRange.max}`}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isPriceDropdownOpen ? "transform rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isPriceDropdownOpen && (
              <div className="absolute z-10 right-0 md:right-4 mt-1 w-full md:w-96 bg-white border border-gray-300 rounded shadow-lg p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range: ${priceRange.min} - ${priceRange.max}
                    </label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Min: ${priceRange.min}</span>
                          <span>Max: ${priceRange.max}</span>
                        </div>
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          step="1"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: Math.min(Number(e.target.value), prev.max),
                            }))
                          }
                          className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer"
                        />
                        <input
                          type="range"
                          min={priceBounds.min}
                          max={priceBounds.max}
                          step="1"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: Math.max(Number(e.target.value), prev.min),
                            }))
                          }
                          className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>${priceBounds.min}</span>
                          <span>${priceBounds.max}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Quick select:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPriceRange({
                                min: priceBounds.min,
                                max: Math.min(50, priceBounds.max),
                              });
                              setIsPriceDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className="text-sm px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Under $50
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPriceRange({
                                min: 50,
                                max: Math.min(100, priceBounds.max),
                              });
                              setIsPriceDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className="text-sm px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            $50 - $100
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPriceRange({
                                min: 100,
                                max: Math.min(200, priceBounds.max),
                              });
                              setIsPriceDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className="text-sm px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            $100 - $200
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPriceRange({
                                min: 200,
                                max: priceBounds.max,
                              });
                              setIsPriceDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className="text-sm px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Over $200
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPriceRange({
                            min: priceBounds.min,
                            max: priceBounds.max,
                          });
                          setIsPriceDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className="w-full text-sm text-gray-700 hover:text-gray-900 py-2 font-medium"
                      >
                        Reset to all prices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full"
            >
              Category: {type}
              <button
                onClick={() => handleTypeToggle(type)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
          {(priceRange.min > priceBounds.min ||
            priceRange.max < priceBounds.max) && (
              <span className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                Price: ${priceRange.min} - ${priceRange.max}
                <button
                  onClick={() =>
                    setPriceRange({ min: priceBounds.min, max: priceBounds.max })
                  }
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            )}
          {selectedSizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full"
            >
              Size: {size}
              <button
                onClick={() => handleSizeToggle(size)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
          <span className="inline-flex items-center border border-gray-300 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
            Sorted by: {getSortDisplayText()}
          </span>
          {(selectedTypes.length > 0 ||
            selectedSizes.length > 0 ||
            priceRange.min > priceBounds.min ||
            priceRange.max < priceBounds.max) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5"
              >
                Clear All Filters
              </button>
            )}
        </div>
      </div>

      {/* Product Grid Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedTypes.length === 0
            ? "All Products"
            : selectedTypes.length === 1
              ? selectedTypes[0]
              : `${selectedTypes.length} Categories`}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredAndSortedProducts.length} products)
          </span>
        </h1>
        <div className="mt-2 md:mt-0 text-sm text-gray-600">
          Showing{" "}
          {Math.min(indexOfFirstProduct + 1, filteredAndSortedProducts.length)}-
          {Math.min(indexOfLastProduct, filteredAndSortedProducts.length)} of{" "}
          {filteredAndSortedProducts.length} products
        </div>
      </div>

      {/* Product Grid */}
      {currentProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {currentProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded border font-medium ${currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === "number" && paginate(page)}
                      disabled={page === "..."}
                      className={`w-10 h-10 flex items-center justify-center rounded border font-medium ${page === "..."
                          ? "text-gray-400 border-transparent cursor-default"
                          : currentPage === page
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded border font-medium ${currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                >
                  Next
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Show:</span>
                <select
                  value={productsPerPage}
                  onChange={(e) => {
                    setProductsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">
            <i className="fas fa-box-open"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            Try changing your filter criteria
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;