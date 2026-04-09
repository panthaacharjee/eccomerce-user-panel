import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Order,
  OrderState,
} from '../interfaces/orderInterface'; // Adjust import path as needed

// Initial state
const initialState: OrderState = {
  success: null,
  loading: false,
  orders: [],
  error: null,
};

interface IOrderResponse{
  orders:Order[];
  message:string;
}

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Create Order Actions
    createOrderRequest: (state) => {
      state.loading = true;
      state.success = null;
      state.error = null;
    },
    createOrderSuccess: (state, action: PayloadAction<IOrderResponse>) => {
      state.loading = false;
      state.success = action.payload.message;
      state.orders = action.payload.orders;
      state.error = null;
    },
    createOrderFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.success = null;
      state.error = action.payload;
    },

    // Get User Orders Actions
    getUserOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getUserOrdersSuccess: (state, action: PayloadAction<IOrderResponse>) => {
      state.loading = false;
      state.orders = action.payload.orders;
      state.error = null;
    },
    getUserOrdersFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    // Clear success message
    clearSuccess: (state) => {
      state.success = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    
  },
});

// Export actions
export const {
  createOrderRequest,
  createOrderSuccess,
  createOrderFail,

  getUserOrdersRequest,
  getUserOrdersSuccess,
  getUserOrdersFail,

  clearSuccess,
  clearError,

} = orderSlice.actions;

// Export reducer
export default orderSlice.reducer;

