import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "@/redux/reducers/userReducer";
import productReducer from "./reducers/productReducer";
import homeReducer from "./reducers/homeReducer"
import cartReducer from "./reducers/cartReducer";
import orderItemsReducer from "./reducers/orderItemsReducer";
import orderReducer from "./reducers/orderReducer";


const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  home: homeReducer,
  cart: cartReducer,
  orderItems: orderItemsReducer,
  order: orderReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
