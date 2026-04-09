"use client";

import Carousel from "@/components/Carousel";
import Link from "next/link";
import SafeImage from "@/components/SafeImage"; // Import the SafeImage component

/* ============== IMAGES ================ */
import Image1 from "@/images/image1.webp";
import Image2 from "@/images/image2.webp";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import {
  GetCategoryFail,
  GetCategoryRequest,
  GetCategorySuccess,
} from "@/redux/reducers/homeReducer";
import { useEffect } from "react";
import Axios from "@/components/Axios";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Home() {
  const dispatch = useDispatch();
  const { category } = useSelector((state: RootState) => state.home);


  const formatForUrl = (text: string): string => {
    return text.toLowerCase().replace(/\s+/g, '-');
  };

  // Filter out items with invalid src (with proper type checking)
  const image = category
    .filter((val:any) => {
      // Check if category_image exists and is a string with content
      return (
        val.category_image &&
        typeof val.category_image.url === "string" &&
        val.category_image.url !== ""
      );
    })
    .map((val) => {
      return {
        src: val.category_image.url,
        title: val.main_label,
        category: val.main_label,
      };
    });

  const getCategory = async () => {
    try {
      dispatch(GetCategoryRequest());
      const { data } = await Axios.get("/category");
      dispatch(GetCategorySuccess(data));
    } catch (err: any) {
      dispatch(GetCategoryFail(err.response?.data?.message || "Failed to fetch categories"));
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <div>
      <Carousel />

      {/* Top Categories Section */}
      <div>
        <div className="divider mt-10">
          <div className="uppercase text-md font-semibold tracking-widest">
            Top Categories
          </div>
        </div>

        <div className="container mx-auto px-4 mt-10 mb-20 lg:mb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {image.map((val, ind) => (
              <Link href={`/collections/${formatForUrl(val.category)}`} key={ind} className="w-full">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden relative cursor-pointer hover:scale-105 transition-transform duration-300 w-full">
                  <div className="relative w-full aspect-square">
                    <SafeImage
                      src={val.src}
                      alt={val.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={ind < 4}
                    />

                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent">
                      <p className="text-blue-50 text-sm font-bold text-center p-4 sm:p-6 pb-4 sm:pb-8">
                        {val.title}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Description */}
      <div className="border-t border-b border-[#adadad] mt-20 py-5">
        <div className="container mx-auto px-4 lg:px-0 lg:w-6/12">
          <p className="text-center font-light">
            YELLOW exists to deliver premium-quality and contemporary designs
            for style-conscious urbanites. The brand name reflects warmth,
            loyalty, and long-lasting connections. With a promise of versatile
            style, superior comfort, and a joyful shopping experience, YELLOW
            continues to brighten the everyday wardrobes of modern city life.
          </p>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="container mx-auto lg:w-10/12 flex justify-center lg:justify-between flex-wrap mt-20">
        <Link href="/">
          <div className="mt-5 w-6/12 min-w-[350px] lg:min-w-[550px] bg-white rounded-lg shadow-lg overflow-hidden relative cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="relative w-full aspect-square">
              <Image
                src={Image2}
                alt="Watch Latest Videos on Youtube"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
                priority
              />

              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <p className="text-blue-50 text-sm font-bold text-center p-6 pb-8">
                  Watch Latest Videos on Youtube
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/">
          <div className="mt-5 w-6/12 min-w-[350px] lg:min-w-[550px] bg-white rounded-lg shadow-lg overflow-hidden relative cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="relative w-full aspect-square">
              <Image
                src={Image1}
                alt="Our Beautiful Images on Instagram"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
                priority
              />

              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <p className="text-blue-50 text-sm font-bold text-center p-6 pb-8">
                  Our Beautiful Images on Instagram
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Newsletter Subscription */}
      <div className="container mx-auto lg:w-8/12 flex flex-wrap items-center justify-center lg:justify-between mt-20 mb-20">
        <p className="text-md lg:text-2xl font-bold tracking-widest text-center lg:text-start lg:w-[270px]">
          Subscribe for HETTY newsletters!
        </p>

        <div className="mt-4 lg:mt-0">
          <form
            className="flex gap-2 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              // Handle newsletter subscription
              console.log("Newsletter form submitted");
            }}
          >
            <input
              type="email"
              placeholder="Your e-mail address..."
              className="lg:w-[350px] flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white font-medium hover:bg-[#353535] cursor-pointer transition-colors duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}