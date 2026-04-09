export interface CartItem {
    _id: string;
    title: string;
    thumbnail: string;
    price: number;
    currency: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    addedAt: Date;
}


export interface CartState {
    cartItems: CartItem[];
    isLoading: boolean;
    error: string | null;
}