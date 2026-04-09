"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/Product/ProductCard";
import ZoomableImage from "@/components/ZoomableImage";
import { Product } from "@/redux/interfaces/productInterface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { GetSingleProductFail, GetSingleProductRequest, GetSingleProductSuccess } from "@/redux/reducers/productReducer";
import Axios from "@/components/Axios";
import {
    AddToCartRequest,
    AddToCartSuccess,
    AddToCartFail,
    GetCartRequest,
    GetCartSuccess,
    GetCartFail
} from "@/redux/reducers/cartReducer";
import {
    AddOrderItemsRequest,
    AddOrderItemsSuccess,
    AddOrderItemsFail,
    GetOrderItemsRequest,
    GetOrderItemsSuccess,
    GetOrderItemsFail
} from "@/redux/reducers/orderItemsReducer";
import { CartItem } from "@/redux/interfaces/cartInterface";
import { OrderItem } from "@/redux/interfaces/orderItemsInterface";

export default function ProductDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product } = useSelector((state: RootState) => state.product);
    const { cartItems, isLoading: cartLoading } = useSelector((state: RootState) => state.cart);
    const { orderItems, loading: orderLoading } = useSelector((state: RootState) => state.orderItems);

    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const productImageRef = useRef<HTMLDivElement>(null);
    const cartIconRef = useRef<HTMLDivElement>(null);

    const productId = id;
    const router = useRouter();

    // Load cart from localStorage on component mount
    useEffect(() => {
        loadCartFromStorage();
        loadOrderItemsFromStorage();
    }, []);

    // Sync cart with localStorage whenever cartItems change
    useEffect(() => {
        if (cartItems.length > 0) {
            saveCartToStorage(cartItems);
        } else {
            localStorage.removeItem("cart");
        }
    }, [cartItems]);

    // Sync orderItems with localStorage whenever orderItems change
    useEffect(() => {
        if (orderItems.length > 0) {
            saveOrderItemsToStorage(orderItems);
        } else {
            localStorage.removeItem("orderItems");
        }
    }, [orderItems]);

    // Load cart from localStorage and dispatch to Redux
    const loadCartFromStorage = () => {
        try {
            dispatch(GetCartRequest());
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                const parsedCart = JSON.parse(storedCart);
                const cartWithDates = parsedCart.map((item: any) => ({
                    ...item,
                    addedAt: new Date(item.addedAt)
                }));

                dispatch(GetCartSuccess({
                    cartItems: cartWithDates,
                    isLoading: false,
                    error: null
                }));
            } else {
                dispatch(GetCartSuccess({
                    cartItems: [],
                    isLoading: false,
                    error: null
                }));
            }
        } catch (error) {
            console.error("Error loading cart from localStorage:", error);
            dispatch(GetCartFail("Failed to load cart from storage"));
        }
    };

    // Load orderItems from localStorage and dispatch to Redux
    const loadOrderItemsFromStorage = () => {
        try {
            dispatch(GetOrderItemsRequest());
            const storedOrder = localStorage.getItem("orderItems");
            if (storedOrder) {
                const parsedOrder = JSON.parse(storedOrder);

                // Calculate total amount
                const totalAmount = parsedOrder.reduce(
                    (total: number, item: OrderItem) => total + (item.price * item.quantity),
                    0
                );

                dispatch(GetOrderItemsSuccess({
                    orderItems: parsedOrder,
                    totalAmount: totalAmount,
                    loading: false,
                    error: null
                }));
            } else {
                dispatch(GetOrderItemsSuccess({
                    orderItems: [],
                    totalAmount: 0,
                    loading: false,
                    error: null
                }));
            }
        } catch (error) {
            console.error("Error loading orderItems from localStorage:", error);
            dispatch(GetOrderItemsFail("Failed to load order items from storage"));
        }
    };

    // Save cart to localStorage
    const saveCartToStorage = (cart: CartItem[]) => {
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);
        }
    };

    // Save orderItems to localStorage
    const saveOrderItemsToStorage = (order: OrderItem[]) => {
        try {
            localStorage.setItem("orderItems", JSON.stringify(order));
        } catch (error) {
            console.error("Error saving orderItems to localStorage:", error);
        }
    };

    // Set default size and color when product loads
    useEffect(() => {
        if (product) {
            if (product.sizes && product.sizes.length > 0) {
                const firstAvailableSize = product.sizes.find(s => s.stock_quantity > 0) || product.sizes[0];
                setSelectedSize(firstAvailableSize.title);
            }

            if (product.colors && product.colors.length > 0) {
                const firstAvailableColor = product.colors.find(c => c.stock_quantity > 0) || product.colors[0];
                setSelectedColor(firstAvailableColor.title);
            }
        }
    }, [product]);

    // Calculate total price based on selected size/color and quantity
    const getCurrentPrice = () => {
        if (!product) return 0;

        if (selectedSize && product.sizes && product.sizes.length > 0) {
            const selectedSizeObj = product.sizes.find(
                (s) => s.title === selectedSize,
            );
            if (selectedSizeObj) return selectedSizeObj.price;
        }

        if (selectedColor && product.colors && product.colors.length > 0) {
            const selectedColorObj = product.colors.find(
                (c) => c.title === selectedColor,
            );
            if (selectedColorObj) return selectedColorObj.price;
        }

        return product.price;
    };

    const totalPrice = getCurrentPrice() * quantity;

    // Get stock for selected size/color combination
    const getCurrentStock = () => {
        if (!product) return 0;

        if (selectedSize && product.sizes && product.sizes.length > 0) {
            const sizeObj = product.sizes.find((s) => s.title === selectedSize);
            if (sizeObj) return sizeObj.stock_quantity;
        }

        if (selectedColor && product.colors && product.colors.length > 0) {
            const colorObj = product.colors.find((c) => c.title === selectedColor);
            if (colorObj) return colorObj.stock_quantity;
        }

        return product.stock_quantity;
    };

    const currentStock = getCurrentStock();

    // Handle size selection
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
        setQuantity(1);
    };

    // Handle color selection
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setQuantity(1);
    };

    // Calculate average rating
    const getAverageRating = () => {
        if (!product?.review || product.review.length === 0) return null;
        const total = product.review.reduce((sum, review) => sum + review.rating, 0);
        return (total / product.review.length).toFixed(1);
    };

    // Get rating counts for each star level
    const getRatingCounts = () => {
        if (!product?.review || product.review.length === 0) return {};
        const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        product.review.forEach((review) => {
            counts[review.rating] = (counts[review.rating] || 0) + 1;
        });
        return counts;
    };

    const averageRating = getAverageRating();
    const ratingCounts = getRatingCounts();
    const totalReviews = product?.review?.length || 0;

    // Save viewed product to localStorage
    const saveViewedProduct = (product: Product) => {
        if (typeof window !== "undefined") {
            try {
                const viewed = localStorage.getItem("viewedProducts");
                let viewedProducts = viewed ? JSON.parse(viewed) : [];

                viewedProducts = viewedProducts.filter(
                    (p: Product) => p._id !== product._id,
                );

                viewedProducts.unshift(product);
                viewedProducts = viewedProducts.slice(0, 10);

                localStorage.setItem("viewedProducts", JSON.stringify(viewedProducts));
                setViewedProducts(viewedProducts);
            } catch (error) {
                console.error("Error saving viewed product:", error);
            }
        }
    };

    // Get viewed products from localStorage
    const getViewedProducts = () => {
        if (typeof window !== "undefined") {
            try {
                const viewed = localStorage.getItem("viewedProducts");
                return viewed ? JSON.parse(viewed) : [];
            } catch (error) {
                console.error("Error getting viewed products:", error);
                return [];
            }
        }
        return [];
    };

    // Fetch related products by sub_category
    const fetchRelatedProducts = async () => {
        if (!product || !product.categories?.sub_category) return;

        try {
            const { data } = await Axios.get(`/get/products/by/subcategory`, {
                params: {
                    sub_category: product.categories.sub_category,
                    excludeId: product._id,
                    limit: 8
                }
            });

            const allProducts = data.products || [];
            const flattenedProducts = allProducts.flatMap((item: any) => {
                return Array.isArray(item) ? item : [item];
            });

            const uniqueProducts = flattenedProducts
                .filter((p: Product, index: number, self: Product[]) =>
                    index === self.findIndex((t) => t._id === p._id)
                )
                .slice(0, 4);

            setRelatedProducts(uniqueProducts);
        } catch (error) {
            console.error("Error fetching related products:", error);
        }
    };

    const getSingleProduct = async () => {
        try {
            setLoading(true);
            dispatch(GetSingleProductRequest());
            const { data } = await Axios.get(`/get/user/single/product/${productId}`);
            dispatch(GetSingleProductSuccess(data));

            if (data) {
                saveViewedProduct(data);
            }
        } catch (err: any) {
            dispatch(GetSingleProductFail(err.response?.data?.message || "Error fetching product"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            getSingleProduct();
            setViewedProducts(getViewedProducts());
        }
    }, [productId]);

    useEffect(() => {
        if (product) {
            fetchRelatedProducts();
        }
    }, [product]);

    // Handle Add to Cart function using Redux
    const handleAddToCart = (product: Product, qty: number = quantity) => {
        if (!product || currentStock === 0) return;

        try {
            dispatch(AddToCartRequest());

            const currentPrice = getCurrentPrice();

            const newCartItem: CartItem = {
                _id: product._id || product._id || '',
                title: product.title,
                thumbnail: product.thumbnail || (product.images && product.images[0]?.url) || '',
                price: currentPrice,
                currency: product.currency || 'USD',
                quantity: qty,
                selectedSize: selectedSize || undefined,
                selectedColor: selectedColor || undefined,
                addedAt: new Date(),
            };

            const existingItemIndex = cartItems.findIndex(
                (item) =>
                    item._id === newCartItem._id &&
                    item.selectedSize === newCartItem.selectedSize &&
                    item.selectedColor === newCartItem.selectedColor
            );

            let updatedCart: CartItem[];

            if (existingItemIndex > -1) {
                updatedCart = [...cartItems];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity: updatedCart[existingItemIndex].quantity + qty
                };
            } else {
                updatedCart = [...cartItems, newCartItem];
            }

            dispatch(AddToCartSuccess({
                cartItems: updatedCart,
                isLoading: false,
                error: null
            }));

            showNotification(
                `${product.title} ${selectedSize ? `(${selectedSize})` : ""} ${selectedColor ? `(${selectedColor})` : ""} added to cart!`,
                "success"
            );

        } catch (error: any) {
            dispatch(AddToCartFail(error.message || "Failed to add item to cart"));
            showNotification("Failed to add item to cart", "error");
        }
    };

    const handleBuyNow = () => {
        if (!product || currentStock === 0) return;

        try {
            dispatch(AddOrderItemsRequest());

            const currentPrice = getCurrentPrice();

            // Create a single order item for the current product
            const newOrderItem: OrderItem = {
                id: product._id,
                title: product.title,
                price: currentPrice,
                quantity: quantity,
                selectedSize: selectedSize || undefined,
                thumbnail: product.thumbnail || (product.images && product.images[0]?.url) || '',
                total: currentPrice * quantity,
            };

            // Create a new array with only this item (overwrites any existing order items)
            const updatedOrder = [newOrderItem];

            // Calculate total amount (just this item)
            const totalAmount = newOrderItem.total;

            // Save to Redux (overwrites existing order items)
            dispatch(AddOrderItemsSuccess({
                orderItems: updatedOrder,
                totalAmount: totalAmount,
                loading: false,
                error: null
            }));

            // Directly save to localStorage (overwrites any existing order items)
            localStorage.setItem("orderItems", JSON.stringify(updatedOrder));

            showNotification(
                `Processing order for ${product.title}...`,
                "success"
            );

            // Navigate to checkout
            setTimeout(() => {
                router.push("/checkout");
            }, 500);

        } catch (error: any) {
            dispatch(AddOrderItemsFail(error.message || "Failed to process order"));
            showNotification("Failed to process order", "error");
        }
    };

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 ${type === 'success' ? 'bg-black' : 'bg-black'} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("animate-fade-out");
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    const increaseQuantity = () => {
        if (quantity < currentStock || currentStock === 0) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product?.currency || 'USD',
            minimumFractionDigits: 2,
        }).format(price);
    };

    // Filter out current product from viewed products
    const filteredViewedProducts = viewedProducts
        .filter(
            (viewedProduct) =>
                viewedProduct._id !== product?._id &&
                !relatedProducts.some((related) => related._id === viewedProduct._id),
        )
        .slice(0, 4);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Product Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="inline-block px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    const productImages = product.images || [];
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;

    const uniqueColors = hasColors ? [...new Map(product.colors!.map(c => [c.title, c])).values()] : [];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Cart Icon Reference */}
            <div ref={cartIconRef} className="fixed top-4 right-20 z-40"></div>

            {/* Loading Indicators */}
            {(cartLoading || orderLoading) && (
                <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    {cartLoading ? "Updating cart..." : "Processing order..."}
                </div>
            )}

            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-gray-600">
                <button onClick={() => router.push("/")} className="hover:text-gray-900">
                    Home
                </button>
                <span className="mx-2">/</span>
                <button onClick={() => router.push("/collections")} className="hover:text-gray-900">
                    {product.categories?.main_category || "Collections"}
                </button>
                {product.categories?.sub_category && (
                    <>
                        <span className="mx-2">/</span>
                        <button
                            onClick={() => router.push(`/collections/${product.categories?.sub_category?.toLowerCase()}`)}
                            className="hover:text-gray-900"
                        >
                            {product.categories.sub_category}
                        </button>
                    </>
                )}
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.title}</span>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Product Image Gallery */}
                <div className="space-y-4" ref={productImageRef}>
                    {/* Main Image with Zoom */}
                    <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                        {productImages.length > 0 ? (
                            <div className="relative aspect-square">
                                <ZoomableImage
                                    src={productImages[selectedImageIndex]?.url || product.thumbnail}
                                    alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                                    zoomScale={2.5}
                                    className="w-full h-full"
                                />

                                {/* Fullscreen Button */}
                                <button
                                    onClick={() => setIsZoomModalOpen(true)}
                                    className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                                <i className="fas fa-image text-6xl text-gray-400"></i>
                            </div>
                        )}
                    </div>

                    {/* Image Thumbnails */}
                    {productImages.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {productImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleImageClick(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                        ? "border-gray-900 ring-2 ring-gray-900 ring-opacity-20"
                                        : "border-transparent hover:border-gray-300"
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {product.title}
                    </h1>

                    <div className="mb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-lg mt-3 font-bold text-gray-900">
                                {formatPrice(getCurrentPrice())}
                            </span>
                            {product.cost_price && product.cost_price > getCurrentPrice() && (
                                <>
                                    <span className="text-lg text-gray-500 line-through">
                                        {formatPrice(product.cost_price)}
                                    </span>
                                    <span className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                                        Save {formatPrice(product.cost_price - getCurrentPrice())}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Rating Section */}
                        {totalReviews > 0 ? (
                            <div className="mt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <span className="text-3xl font-bold text-gray-900 mr-2">
                                            {averageRating}
                                        </span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => {
                                                const rating = parseFloat(averageRating || "0");
                                                const filled = i < Math.floor(rating);
                                                const half = !filled && i < Math.ceil(rating) && rating % 1 >= 0.5;

                                                return (
                                                    <svg
                                                        key={i}
                                                        className={`w-5 h-5 ${filled ? "text-yellow-400" : half ? "text-yellow-300" : "text-gray-300"}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        {half ? (
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        ) : (
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        )}
                                                    </svg>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <span className="text-gray-600">
                                        Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                                    </span>
                                </div>

                                {/* Rating Breakdown */}
                                <div className="mt-4 space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 w-12">{star} star</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    style={{
                                                        width: `${totalReviews > 0 ? (ratingCounts[star] || 0) / totalReviews * 100 : 0}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 w-12">
                                                {ratingCounts[star] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-gray-500">
                                No reviews yet
                            </div>
                        )}
                    </div>

                    {/* Size Selection */}
                    {hasSizes && (
                        <div className="mb-6">
                            <label className="block text-gray-600 mb-3 font-medium">
                                Select Size
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((sizeOption) => {
                                    const isSelected = selectedSize === sizeOption.title;
                                    const isOutOfStock = sizeOption.stock_quantity === 0;
                                    return (
                                        <button
                                            key={sizeOption.title}
                                            onClick={() => !isOutOfStock && handleSizeSelect(sizeOption.title)}
                                            disabled={isOutOfStock}
                                            className={`px-4 py-2 rounded-lg border transition-all ${isSelected
                                                ? "bg-gray-900 text-white border-gray-900"
                                                : isOutOfStock
                                                    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="font-medium">{sizeOption.title}</span>
                                                <span
                                                    className={`text-sm ${isSelected ? "text-gray-300" : "text-gray-500"}`}
                                                >
                                                    {formatPrice(sizeOption.price)}
                                                </span>
                                                {isOutOfStock && (
                                                    <span className="text-xs text-red-500 mt-1">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Color Selection */}
                    {hasColors && (
                        <div className="mb-6">
                            <label className="block text-gray-600 mb-3 font-medium">
                                Select Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {uniqueColors.map((colorOption) => {
                                    const isSelected = selectedColor === colorOption.title;
                                    const colorStock = product.colors?.find(c => c.title === colorOption.title)?.stock_quantity || 0;
                                    const isOutOfStock = colorStock === 0;
                                    return (
                                        <button
                                            key={colorOption.title}
                                            onClick={() => !isOutOfStock && handleColorSelect(colorOption.title)}
                                            disabled={isOutOfStock}
                                            className={`px-4 py-2 rounded-lg border transition-all ${isSelected
                                                ? "bg-gray-900 text-white border-gray-900"
                                                : isOutOfStock
                                                    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="font-medium">{colorOption.title}</span>
                                                <span
                                                    className={`text-sm ${isSelected ? "text-gray-300" : "text-gray-500"}`}
                                                >
                                                    {formatPrice(colorOption.price)}
                                                </span>
                                                {isOutOfStock && (
                                                    <span className="text-xs text-red-500 mt-1">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Description
                        </h3>
                        <div
                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />

                        {/* Keywords/Tags */}
                        {product.keywords && product.keywords.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {product.keywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                                    >
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center">
                            <span className="w-32 text-gray-600">SKU:</span>
                            <span className="font-medium">{product.sku}</span>
                        </div>
                        {product.ean && (
                            <div className="flex items-center">
                                <span className="w-32 text-gray-600">EAN:</span>
                                <span className="font-medium">{product.ean}</span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <span className="w-32 text-gray-600">Category:</span>
                            <span className="font-medium">
                                {product.categories?.main_category || "N/A"}
                                {product.categories?.sub_category && ` / ${product.categories.sub_category}`}
                            </span>
                        </div>
                        {product.weight && (
                            <div className="flex items-center">
                                <span className="w-32 text-gray-600">Weight:</span>
                                <span className="font-medium">
                                    {product.weight} {product.weight_unit}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <span className="w-32 text-gray-600">Availability:</span>
                            <span
                                className={`font-medium ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {currentStock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-8">
                        <label className="block text-gray-600 mb-3 font-medium">
                            Quantity
                        </label>
                        <div className="flex items-center">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={decreaseQuantity}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity <= 1}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 12H4"
                                        />
                                    </svg>
                                </button>
                                <div className="w-16 text-center py-3 bg-white text-gray-900 font-medium">
                                    {quantity}
                                </div>
                                <button
                                    onClick={increaseQuantity}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={currentStock > 0 && quantity >= currentStock}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="ml-4">
                                <span className="text-lg font-semibold text-gray-900">
                                    Total: {formatPrice(totalPrice)}
                                </span>
                            </div>
                        </div>
                        {currentStock > 0 && currentStock < 10 && (
                            <p className="mt-2 text-sm text-orange-500">
                                Only {currentStock} items left in stock!
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAddToCart(product)}
                                disabled={currentStock === 0 || cartLoading || orderLoading}
                                className={`w-full py-4 px-6 rounded-lg transition-colors font-medium flex items-center justify-center gap-3 group ${currentStock === 0 || cartLoading || orderLoading
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-900 text-white hover:bg-gray-800"
                                    }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 group-hover:scale-110 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                {cartLoading ? "Adding..." : currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={currentStock === 0 || cartLoading || orderLoading}
                                className={`w-full py-4 px-6 rounded-lg transition-colors font-medium flex items-center justify-center gap-3 group ${currentStock === 0 || cartLoading || orderLoading
                                    ? "bg-blue-300 text-white cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 group-hover:scale-110 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                                {orderLoading ? "Processing..." : "Buy Now"}
                            </button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-gray-900 font-medium mb-1">
                                    Free Shipping
                                </div>
                                <div className="text-gray-600 text-sm">On orders over BDT 50</div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-900 font-medium mb-1">
                                    7-Day Returns
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Money back guarantee
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-900 font-medium mb-1">
                                    Secure Payment
                                </div>
                                <div className="text-gray-600 text-sm">SSL encrypted</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        Related Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct._id}
                                product={relatedProduct}
                            />
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                }

                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }

                .animate-fade-out {
                    animation: fadeOut 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}