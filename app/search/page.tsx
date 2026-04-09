"use client"

import ProductGrid from "@/components/Product/ProductGrid";
import { GetAllProductFail, GetAllProductRequest, GetAllProductSuccess } from "@/redux/reducers/productReducer";
import Axios from "../../components/Axios"
import { useDispatch,  useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {  useSearchParams } from "next/navigation";



export default function SearchPage() {

  const dispatch = useDispatch();
  const searchParams = useSearchParams();
    const { products, loading, error } = useSelector(
      (state: RootState) => state.product,
    );
  
  const getAllProducts = async (searchParams: URLSearchParams) => {
    try {
      dispatch(GetAllProductRequest());

      // Only include parameters that are actually provided
      const params: any = {};

      const query = searchParams.get("q");
      if (query && query.trim()) {
        params.q = query.trim();
      }

      const category = searchParams.get("category");
      if (category && category.trim()) {
        params.category = category.trim();
      }

      const { data } = await Axios.get("/get/user/products", { params });
      dispatch(GetAllProductSuccess(data));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch products";
      dispatch(GetAllProductFail(errorMessage));
      toast.error(errorMessage);
    }
  };

    // console.log(products)
  
    useEffect(() => {
      getAllProducts(searchParams);
    }, [searchParams]);
  
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Error Loading Products
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => getAllProducts(searchParams)}
            className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      );
    }
  return (
    <main>
      {products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-gray-300 text-6xl mb-4">
            <i className="fas fa-box-open"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Products Available
          </h3>
          <p className="text-gray-500">Check back later for new products</p>
        </div>
      )}
    </main>
  );
}
