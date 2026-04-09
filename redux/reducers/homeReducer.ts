// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category, HomeState, Navitem, Slider } from "../interfaces/homeInterface";


const initialState: HomeState = {
  status: false,
  loading: false,
  sliders: [],
  navitems:[],
  category: [],
  error: null,
  success: null,
};

interface ISliderRespones {
  sliders: Slider[];
  message: string;
}

interface INavitemsResponse {
  navItems: Navitem[];
  message: string;
}


interface ICategoryResponse {
    categoryItems: Category[];
    message: string;
}

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    GetSliderRequest(state) {
      state.loading = true;
    },
    GetSliderSuccess(state, action: PayloadAction<ISliderRespones>) {
      state.loading = false;
      state.sliders = action.payload.sliders;
    },
    GetSliderFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

      GetNavItemRequest(state) {
          state.loading = true;
      },
      GetNavItemSuccess(state, action: PayloadAction<INavitemsResponse>) {
          state.loading = false;
          state.navitems = action.payload.navItems;
      },
      GetNavItemFail(state, action: PayloadAction<string>) {
          state.loading = false;
          state.error = action.payload;
      },


      GetCategoryRequest(state) {
          state.loading = true;
      },
      GetCategorySuccess(state, action: PayloadAction<ICategoryResponse>) {
          state.loading = false;
          state.category = action.payload.categoryItems;
      },
      GetCategoryFail(state, action: PayloadAction<string>) {
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
GetSliderRequest,
GetSliderSuccess,
GetSliderFail,

GetNavItemRequest,
GetNavItemSuccess,
GetNavItemFail,

GetCategoryRequest,
GetCategorySuccess,
GetCategoryFail,

  CreateClearSuccess,
  CreateClearError,
} = homeSlice.actions;

export default homeSlice.reducer;
