import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaChevronRight,
  FaChevronDown,
  FaHome,
  FaUser,
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaSignOutAlt,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { GetNavItemFail, GetNavItemRequest, GetNavItemSuccess } from "@/redux/reducers/homeReducer";
import Axios from "./Axios";

const Navmenu = () => {
  const dispatch = useDispatch();
  const { status } = useSession();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const { navitems } = useSelector((state: RootState) => state.home);
  

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Mock user state
  const isLoggedIn = false;

  // Category data
  const categories = navitems &&  navitems.reduce((acc: any, item) => {
    acc[item.main_label.toLowerCase()] = {
      title: item.main_label,
      items: item.sub_label.map((sub) => ({
        name: sub.title,
        href: `/collections/${item.main_label.toLowerCase()}/${sub.title.toLowerCase().replace(/\s+/g, "-")}`,
      })),
    };
    return acc;
  }, {});

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleCloseDrawer = () => {
    const drawerCheckbox = document.getElementById(
      "my-drawer-7",
    ) as HTMLInputElement;
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };

  const getNavItems = async() => {
    try {
      dispatch(GetNavItemRequest());
      const {data}  = await Axios.get("/navitems");

      dispatch(GetNavItemSuccess(data));
    } catch (error:any) {
      dispatch(GetNavItemFail(error.message || "Failed to fetch navigation items"));
    }
  }

  useEffect(() => { 
    getNavItems();
   }, [dispatch]);

  return (
    <div className="h-full">
      {/* User Info Section */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
          <FaUser className="text-gray-600 text-2xl" />
        </div>
        <div className="flex-1">
          {status === "authenticated" ? (
            <>
              <h3 className="font-bold text-gray-900 text-lg">
                {user && user?.firstName} {user && user?.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user && user?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Premium Member
              </span>
            </>
          ) : (
            status === "unauthenticated" && (
              <>
                <h3 className="font-bold text-gray-900 text-lg">Welcome!</h3>
                <p className="text-sm text-gray-600">
                  Sign in to access your account
                </p>
                <div className="flex space-x-2 mt-2">
                  <label
                    htmlFor="my-drawer-6"
                    className="px-3 py-1 bg-black text-white text-sm rounded-lg cursor-pointer"
                    onClick={handleCloseDrawer}
                  >
                    Sign In
                  </label>
                  <Link
                    href="/create/account"
                    className="px-3 py-1 border border-black text-black text-sm rounded-lg"
                    onClick={handleCloseDrawer}
                  >
                    Register
                  </Link>
                </div>
              </>
            )
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">
          Shop Categories
        </h3>
        <div className="space-y-2">
          {categories && Object.entries(categories).map(([key, category]: [string, any]) => (
            <div key={key} className="border-b border-gray-100">
              <button
                onClick={() => toggleCategory(key)}
                className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="font-medium text-gray-800">
                      {key.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800">
                    {category.title}
                  </span>
                </div>
                {activeCategory === key ? (
                  <FaChevronDown className="text-gray-400" />
                ) : (
                  <FaChevronRight className="text-gray-400" />
                )}
              </button>

              {/* Category Dropdown */}
              {activeCategory === key && (
                <div className="pl-4 pr-2 pb-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {category.items.map((item:any, index:any) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="p-2 text-sm text-gray-700 hover:text-black hover:bg-white rounded-md transition-colors"
                          onClick={handleCloseDrawer}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">
          Quick Links
        </h3>
        <div className="grid grid-cols-2 gap-3 px-2">
          <Link
            href="/new-arrivals"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-2">
              <span className="text-blue-600 font-bold">NEW</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              New Arrivals
            </span>
          </Link>

          <Link
            href="/sale"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mb-2">
              <span className="text-red-600 font-bold">SALE</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Sale</span>
          </Link>

          <Link
            href="/best-sellers"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-2">
              <span className="text-green-600 font-bold">TOP</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              Best Sellers
            </span>
          </Link>

          <Link
            href="/trending"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-2">
              <span className="text-purple-600 font-bold">🔥</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Trending</span>
          </Link>
        </div>
      </div>

      {/* Account Links */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">
          My Account
        </h3>
        <div className="space-y-1 px-2">
          <Link
            href="/profile/me"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaUser className="text-gray-600" size={16} />
            </div>
            <span className="text-gray-800">My Profile</span>
          </Link>

          <Link
            href="/account/orders"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaShoppingBag className="text-gray-600" size={16} />
            </div>
            <span className="text-gray-800">My Orders</span>
          </Link>

          <Link
            href="/wishlist"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaHeart className="text-gray-600" size={16} />
            </div>
            <span className="text-gray-800">My Wishlist</span>
          </Link>

          <Link
            href="/account/addresses"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaMapMarkerAlt className="text-gray-600" size={16} />
            </div>
            <span className="text-gray-800">Saved Addresses</span>
          </Link>

          <Link
            href="/account/payments"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaCreditCard className="text-gray-600" size={16} />
            </div>
            <span className="text-gray-800">Payment Methods</span>
          </Link>

          {isAuthenticated === true && user && <Link
            href="#"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={async () => {
              await signOut();
            }}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiLogOut className="text-gray-600" size={16} />
            </div>
            <span className="text-gray-800">Logout</span>
          </Link>}

        </div>
      </div>

      {/* Support & Help */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 text-lg mb-4 px-2">
          Help & Support
        </h3>
        <div className="space-y-1 px-2">
          <Link
            href="/help"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">?</span>
            </div>
            <span className="text-gray-800">Help Center</span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-medium">✉️</span>
            </div>
            <span className="text-gray-800">Contact Us</span>
          </Link>

          <Link
            href="/about"
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={handleCloseDrawer}
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-medium">i</span>
            </div>
            <span className="text-gray-800">About Us</span>
          </Link>
        </div>
      </div>

    

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-gray-200 px-2">
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/terms"
            className="text-xs text-gray-500 hover:text-black"
            onClick={handleCloseDrawer}
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-gray-500 hover:text-black"
            onClick={handleCloseDrawer}
          >
            Privacy
          </Link>
          <Link
            href="/return-policy"
            className="text-xs text-gray-500 hover:text-black"
            onClick={handleCloseDrawer}
          >
            Returns
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          © 2024 HEATTY. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Navmenu;
