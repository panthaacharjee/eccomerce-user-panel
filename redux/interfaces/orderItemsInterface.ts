export interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    thumbnail: string;
    total: number;
}


export interface OrderState {
    orderItems: OrderItem[];
    totalAmount: number;
    loading: boolean;
    error: string | null;
}