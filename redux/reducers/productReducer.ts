// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, ProductState } from "../interfaces/productInterface";

const initialState: ProductState = {
  status: false,
  loading: false,
  products: [],
  product: null,
  error: null,
  success: null,
};

interface IProductRespones {
  products: Product[];
  message: string;
}

interface ISingleProductRespones {
  product: Product;
  message: string;
}


export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    GetAllProductRequest(state) {
      state.loading = true;
    },
    GetAllProductSuccess(state, action: PayloadAction<IProductRespones>) {
      state.loading = false;
      state.products = action.payload.products;
    },
    GetAllProductFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },


    GetSingleProductRequest(state) {
      state.loading = true;
    },
    GetSingleProductSuccess(state, action: PayloadAction<ISingleProductRespones>) {
      state.loading = false;
      state.product = action.payload.product;
    },
    GetSingleProductFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },


    CreateClearSuccess(state) {
      state.success = null;
    },

    CreateClearError(state) {
      state.error = null;
    },
  },
});

export const {
  GetAllProductRequest,
  GetAllProductSuccess,
  GetAllProductFail,

  GetSingleProductRequest,
  GetSingleProductSuccess,
  GetSingleProductFail,

  CreateClearSuccess,
  CreateClearError,
} = productSlice.actions;

export default productSlice.reducer;
