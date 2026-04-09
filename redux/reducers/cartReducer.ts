// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartState } from "../interfaces/cartInterface";


const isBrowser = typeof window !== 'undefined';

const initialState: CartState = {
    cartItems: isBrowser && localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart")!)
        : [],
    isLoading: false,
    error: null,
};



export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    AddToCartRequest(state) {
      state.isLoading = true;
    },
    AddToCartSuccess(state, action: PayloadAction<CartState>) {
      state.isLoading = false;
      state.cartItems = action.payload.cartItems;
    },
    AddToCartFail(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;         
    },

    GetCartRequest(state) {
        state.isLoading = true;
    },
    GetCartSuccess(state, action: PayloadAction<CartState>) {
        state.isLoading = false;
        state.cartItems = action.payload.cartItems;
    },
    GetCartFail(state, action: PayloadAction<string>) {
        state.isLoading = false;
        state.error = action.payload;   
    },

    RemoveFromCartRequest(state) {
        state.isLoading = true;
    },
    RemoveFromCartSuccess(state, action: PayloadAction<CartState>) {
        state.isLoading = false;
        state.cartItems = action.payload.cartItems;
    },
    RemoveFromCartFail(state, action: PayloadAction<string>) {
        state.isLoading = false;
        state.error = action.payload;
    },
    
    UpdateCartItemRequest(state) {
        state.isLoading = true;
    },
    UpdateCartItemSuccess(state, action: PayloadAction<CartState>) {
        state.isLoading = false;
        state.cartItems = action.payload.cartItems;
    },
    UpdateCartItemFail(state, action: PayloadAction<string>) {
        state.isLoading = false;
        state.error = action.payload;
    },

    ClearCartRequest(state) {
        state.isLoading = true;
    },
    ClearCartSuccess(state) {
        state.isLoading = false;
        state.cartItems = [];
    },
    ClearCartFail(state, action: PayloadAction<string>) {
        state.isLoading = false;
        state.error = action.payload;
    },
  }
});

export const {
  AddToCartRequest,
  AddToCartSuccess,
  AddToCartFail,
  
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
    ClearCartFail,
    
} = cartSlice.actions;

export default cartSlice.reducer;
