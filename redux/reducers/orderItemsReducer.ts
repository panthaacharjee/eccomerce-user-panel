
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderState } from "../interfaces/orderItemsInterface";


const isBrowser = typeof window !== 'undefined';


const initialState: OrderState = {
  orderItems: isBrowser && localStorage.getItem("orderItems")
    ? JSON.parse(localStorage.getItem("orderItems")!)
    : [],
  totalAmount: 0,
  loading: false,
  error: null,
};




export const orderSlice  = createSlice({
  name: "orderItems",
  initialState,
  reducers: {
    AddOrderItemsRequest(state) {
      state.loading = true;
    },
    AddOrderItemsSuccess(state, action: PayloadAction<OrderState>) {
      state.loading = false;
      state.orderItems = action.payload.orderItems;
    },
    AddOrderItemsFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;         
    },

    GetOrderItemsRequest(state) {
        state.loading = true;
    },
    GetOrderItemsSuccess(state, action: PayloadAction<OrderState>) {
        state.loading = false;
        state.orderItems = action.payload.orderItems;
    },
    GetOrderItemsFail(state, action: PayloadAction<string>) {
        state.loading = false;
        state.error = action.payload;   
    },

  }
});

export const {
  AddOrderItemsRequest,
  AddOrderItemsSuccess,
  AddOrderItemsFail,
  
    GetOrderItemsRequest,
    GetOrderItemsSuccess,
    GetOrderItemsFail,

    
    
} = orderSlice.actions;

export default orderSlice.reducer;
