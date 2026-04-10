import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import {
  GetCartRequest,
  GetCartSuccess,
  GetCartFail,
  RemoveFromCartRequest,
  RemoveFromCartSuccess,
  RemoveFromCartFail,
  UpdateCartItemRequest,
  UpdateCartItemSuccess,
  UpdateCartItemFail,
  ClearCartRequest,
  ClearCartSuccess,
  ClearCartFail
} from "@/redux/reducers/cartReducer";
import {
  AddOrderItemsRequest,
  AddOrderItemsSuccess,
  AddOrderItemsFail,
  GetOrderItemsRequest,
  GetOrderItemsSuccess,
  GetOrderItemsFail,

} from "@/redux/reducers/orderItemsReducer";
import { CartItem } from "@/redux/interfaces/cartInterface";
import { OrderItem } from "@/redux/interfaces/orderItemsInterface";

const ShoppingCart: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get cart state from Redux
  const { cartItems, isLoading: reduxLoading, error } = useSelector((state: RootState) => state.cart);
  const { orderItems, loading: orderLoading } = useSelector((state: RootState) => state.orderItems);

  const [localLoading, setLocalLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    loadCartFromStorage();
    loadOrderItemsFromStorage();
  }, []);

  // Save cart to localStorage whenever it changes in Redux
  useEffect(() => {
    if (!reduxLoading && cartItems.length > 0) {
      saveCartToStorage(cartItems);
    } else if (!reduxLoading && cartItems.length === 0) {
      localStorage.removeItem("cart");
    }
  }, [cartItems, reduxLoading]);

  // Save orderItems to localStorage whenever they change
  useEffect(() => {
    if (!orderLoading && orderItems.length > 0) {
      saveOrderItemsToStorage(orderItems);
    } else if (!orderLoading && orderItems.length === 0) {
      localStorage.removeItem("orderItems");
    }
  }, [orderItems, orderLoading]);

  // Load cart from localStorage and dispatch to Redux
  const loadCartFromStorage = (): void => {
    setLocalLoading(true);
    try {
      dispatch(GetCartRequest());
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Convert string dates back to Date objects and validate
        const validCart = parsedCart
          .filter((item: any) => item._id && item.title && item.price && item.quantity)
          .map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));

        dispatch(GetCartSuccess({
          cartItems: validCart,
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
    } finally {
      setLocalLoading(false);
    }
  };

  // Load orderItems from localStorage and dispatch to Redux
  const loadOrderItemsFromStorage = (): void => {
    try {
      dispatch(GetOrderItemsRequest());
      const savedOrder = localStorage.getItem("orderItems");

      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);

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
  const saveCartToStorage = (items: CartItem[]): void => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  // Save orderItems to localStorage
  const saveOrderItemsToStorage = (items: OrderItem[]): void => {
    try {
      localStorage.setItem("orderItems", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving orderItems to localStorage:", error);
    }
  };

  // Calculate subtotal
  const subtotal: number = cartItems.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0,
  );

  // Calculate total savings (if cost_price exists)
  const totalSavings: number = cartItems.reduce(
    (total: number, item: CartItem) => {
      const originalPrice = (item as any).cost_price || item.price;
      return total + (originalPrice - item.price) * item.quantity;
    },
    0,
  );

  // Calculate total
  const total: number = subtotal;

  // Update quantity
  const updateQuantity = (productId: string, newQuantity: number, selectedSize?: string, selectedColor?: string): void => {
    if (newQuantity < 1) return;

    try {
      dispatch(UpdateCartItemRequest());

      const itemToUpdate = cartItems.find(
        item =>
          item._id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (!itemToUpdate) return;

      const maxQuantity = (itemToUpdate as any).stock_quantity || Infinity;
      const validQuantity = Math.min(newQuantity, maxQuantity);

      const updatedCart = cartItems.map(item => {
        if (
          item._id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        ) {
          return { ...item, quantity: validQuantity };
        }
        return item;
      });

      dispatch(UpdateCartItemSuccess({
        cartItems: updatedCart,
        isLoading: false,
        error: null
      }));

    } catch (error: any) {
      dispatch(UpdateCartItemFail(error.message || "Failed to update quantity"));
    }
  };

  // Remove item
  const removeItem = (productId: string, selectedSize?: string, selectedColor?: string): void => {
    try {
      dispatch(RemoveFromCartRequest());

      const updatedCart = cartItems.filter((item) => {
        if (selectedSize !== undefined && selectedColor !== undefined) {
          return !(item._id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor);
        } else if (selectedSize !== undefined) {
          return !(item._id === productId && item.selectedSize === selectedSize);
        } else if (selectedColor !== undefined) {
          return !(item._id === productId && item.selectedColor === selectedColor);
        } else {
          return item._id !== productId;
        }
      });

      dispatch(RemoveFromCartSuccess({
        cartItems: updatedCart,
        isLoading: false,
        error: null
      }));

    } catch (error: any) {
      dispatch(RemoveFromCartFail(error.message || "Failed to remove item"));
    }
  };

  // Clear entire cart
  const clearCart = (): void => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        dispatch(ClearCartRequest());
        dispatch(ClearCartSuccess());
        localStorage.removeItem("cart");
      } catch (error: any) {
        dispatch(ClearCartFail(error.message || "Failed to clear cart"));
      }
    }
  };

  // Format currency based on item's currency or default to USD
  const formatCurrency = (amount: number, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format to Tk currency (BDT)
  const formatTkCurrency = (amount: number): string => {
    return `Tk ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  // Handle checkout - Convert cart items to order items and navigate to checkout
  const handleCheckout = (): void => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Check stock availability before checkout
    const outOfStockItems = cartItems.filter(item =>
      (item as any).stock_quantity !== undefined && item.quantity > (item as any).stock_quantity
    );

    if (outOfStockItems.length > 0) {
      alert(`Some items are out of stock or have insufficient quantity: 
        ${outOfStockItems.map(item => item.title).join(", ")}`);
      return;
    }

    // Proceed with checkout
    setCheckoutLoading(true);

    try {
      dispatch(AddOrderItemsRequest());

      // Convert cart items to order items
      const newOrderItems: OrderItem[] = cartItems.map(item => ({
        id: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        thumbnail: item.thumbnail,
        total: item.price * item.quantity,
      }));

      // Calculate total amount
      const totalAmount = newOrderItems.reduce(
        (total, item) => total + item.total,
        0
      );

      // Dispatch success with order items
      dispatch(AddOrderItemsSuccess({
        orderItems: newOrderItems,
        totalAmount: totalAmount,
        loading: false,
        error: null
      }));

      // Show success message
      alert("Order items prepared successfully! Redirecting to checkout...");

      // Navigate to checkout page
      router.push("/checkout");

    } catch (error: any) {
      dispatch(AddOrderItemsFail(error.message || "Failed to process checkout"));
      alert("Failed to process checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle continue shopping
  const handleContinueShopping = (): void => {
    router.push("/");
  };

  // Get image URL for product
  const getProductImage = (item: CartItem): string => {
    if (item.thumbnail) return item.thumbnail;
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"; // fallback image
  };

  // Show error message if any
  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
    }
  }, [error]);

  // Loading state
  if (localLoading || reduxLoading) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="w-24 h-24 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Your Shopping Cart is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              shopping to fill it up!
            </p>
            <button
              onClick={handleContinueShopping}
              className="bg-black hover:bg-black text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              disabled={reduxLoading || checkoutLoading}
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>
        <div>
          <div className="p-2 border-b">
            <h2 className="text-sm font-medium text-gray-800">
              Your Items ({cartItems.length})
            </h2>
          </div>
          <div className="h-80 no-scrollbar overflow-x-hidden mt-4">
            {cartItems.map((item: CartItem) => (
              <div key={`${item._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`} className="mt-8 flex items-center">
                <div className="w-3/12">
                  <div className="w-18 h-18 rounded-lg overflow-hidden bg-gray-100 mr-4">
                    <img
                      src={getProductImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="w-9/12">
                  <div className="flex justify-between text-xs font-medium text-gray-900">
                    <p className="line-clamp-2">{item.title}</p>
                    <button
                      onClick={() => removeItem(item._id, item.selectedSize, item.selectedColor)}
                      className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label="Remove item"
                      disabled={reduxLoading || checkoutLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Show selected size/color if available */}
                  {(item.selectedSize || item.selectedColor) && (
                    <div className="mt-1 text-xs text-gray-500">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedSize && item.selectedColor && <span> | </span>}
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center">
                    <div className="flex items-center w-11/12 pr-2">
                      <div className="flex items-center border rounded-lg mr-4">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                          className="p-2 cursor-pointer transition-colors hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1 || reduxLoading || checkoutLoading}
                        >
                          <Minus className="w-2 h-2" />
                        </button>
                        <span className="px-3 py-1 text-gray-900 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          className="p-2 cursor-pointer transition-colors hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Increase quantity"
                          disabled={(item as any).stock_quantity !== undefined && item.quantity >= (item as any).stock_quantity || reduxLoading || checkoutLoading}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm font-semibold text-gray-900">
                        <p className="text-sm">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </p>
                        {(item as any).cost_price && (item as any).cost_price > item.price && (
                          <div className="mt-1">
                            <p className="text-gray-500 line-through text-xs">
                              {formatCurrency((item as any).cost_price * item.quantity, item.currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Low stock warning */}
                  {(item as any).stock_quantity !== undefined &&
                    (item as any).stock_quantity > 0 &&
                    (item as any).stock_quantity <= 5 && (
                      <p className="mt-1 text-xs text-orange-500">
                        Only {(item as any).stock_quantity} left in stock!
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-4 border-t pt-4">
            {totalSavings > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-2">
                <p>Total Savings:</p>
                <p>{formatTkCurrency(totalSavings)}</p>
              </div>
            )}
            <div className="flex justify-between">
              <p className="font-medium">Subtotal:</p>
              <p className="font-medium">{formatTkCurrency(subtotal)}</p>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold">
              <p>Total:</p>
              <p>{formatTkCurrency(total)}</p>
            </div>

            {/* Action Buttons */}
            <div className="uppercase mt-6 space-y-3">
              <button
                onClick={handleCheckout}
                disabled={reduxLoading || checkoutLoading || cartItems.length === 0}
                className="w-full py-3 bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? "Preparing Order..." : reduxLoading ? "Processing..." : "Proceed to Checkout"}
              </button>
              <button
                onClick={handleContinueShopping}
                disabled={reduxLoading || checkoutLoading}
                className="w-full py-3 bg-[#e6e6e6] text-black cursor-pointer hover:bg-gray-300 transition-colors rounded-lg font-medium disabled:opacity-50"
              >
                Continue Shopping
              </button>
            </div>

            {/* Payment Methods */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Secure Checkout • SSL Encrypted</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-gray-100 rounded">Visa</span>
                <span className="px-2 py-1 bg-gray-100 rounded">Mastercard</span>
                <span className="px-2 py-1 bg-gray-100 rounded">Amex</span>
                <span className="px-2 py-1 bg-gray-100 rounded">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;