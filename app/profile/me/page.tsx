"use client";
import Axios from "@/components/Axios";
import { withAuth } from "@/components/withAuth";
import { getUserOrdersFail, getUserOrdersRequest, getUserOrdersSuccess } from "@/redux/reducers/orderReducer";
import { RootState } from "@/redux/rootReducer";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Mock data for demonstration
const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  joinDate: "January 2023",
  phone: "+1 (555) 123-4567",
};

const orderHistory = [
  { id: 1, date: "2023-12-15", total: "$89.99", status: "Delivered", items: 2 },
  {
    id: 2,
    date: "2023-11-28",
    total: "$145.50",
    status: "Delivered",
    items: 3,
  },
  { id: 3, date: "2023-10-10", total: "$67.25", status: "Delivered", items: 1 },
  {
    id: 4,
    date: "2023-09-05",
    total: "$234.00",
    status: "Delivered",
    items: 4,
  },
];

const AccountComponent = () => {
  const dispatch = useDispatch();
  const {data:session} = useSession()
  const {user} = useSelector((state:RootState) => state.user)
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [formData, setFormData] = useState(userData);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    console.log("Saved profile data:", formData);
  };

  const renderPasswordUpdateSection = () => (
    <div className="border-t border-gray-300 pt-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Update Password</h3>
        <button
          onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
          className="text-xs px-4 py-2 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-200"
        >
          {showPasswordUpdate ? "Cancel" : "Change Password"}
        </button>
      </div>

      {showPasswordUpdate && (
        <div className="space-y-4 bg-gray-50 p-6 border border-gray-300">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 bg-white text-gray-900"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 bg-white text-gray-900"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 bg-white text-gray-900"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end">
            <button className="text-xs px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition duration-200">
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs px-4 py-2 border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-200"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 bg-white text-gray-900"
            />
          ) : (
            <div className="p-3 border border-gray-300 bg-gray-50">
              {user ? `${user.firstName} ${user.lastName}` : userData.name}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="p-3 border border-gray-300 bg-gray-50">
            {user ? user.email : userData.email}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 bg-white text-gray-900"
            />
          ) : (
            <div className="p-3 border border-gray-300 bg-gray-50">
              {user?.phone ? user.phone : userData.phone}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member Since
          </label>
          <div className="p-3 border border-gray-300 bg-gray-50">
            {user ? new Date(user.createdAt).toLocaleDateString() : userData.joinDate}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition duration-200"
          >
            Save Changes
          </button>
        </div>
      )}

      {renderPasswordUpdateSection()}
    </div>
  );

  const {orders} = useSelector((state:RootState) => state.order)
  const getUserOrders = async() => {

    
    // Get token (you might need to adjust this based on your auth setup)
    const token = (session?.user as any)?.id || localStorage.getItem("auth-token") || "";
    try{
      dispatch(getUserOrdersRequest())
      const {data} = await Axios.get(`/orders/me`,{
        headers:{
          Authorization: `Bearer ${token}`,
        }
      })
      dispatch(getUserOrdersSuccess(data))
    }catch(err:any){
      dispatch(getUserOrdersFail(err.response?.data?.message || 'Failed to fetch orders'))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, ' ');
  };
  const renderOrderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Order History</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="text-sm p-4 text-left">Order ID</th>
              <th className="text-sm p-4 text-left">Date</th>
              <th className="text-sm p-4 text-left">Items</th>
              <th className="text-sm p-4 text-left">Total</th>
              <th className="text-sm p-4 text-left">Status</th>
              <th className="text-sm p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.map((order, ind) => (
              <tr
                key={ind}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="text-sm p-4 font-medium">
                  #{order.orderId.toString().padStart(6, "0")}
                </td>
                <td className="text-sm p-4">{formatDate(order.orderDate)}</td>
                <td className="text-sm p-4">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </td>
                <td className="text-sm p-4 font-medium">{order.total}</td>
                <td className="text-sm p-4">
                  <span className="text-sm px-3 py-1 bg-gray-100 text-gray-800 text-sm">
                    {order.orderStatus}
                  </span>
                </td>
                <td className="text-sm p-4">
                  <button className="text-gray-700 hover:text-gray-900 underline">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders && orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No orders found.</p>
        </div>
      )}
    </div>
  );

  useEffect(()=>{
    getUserOrders()
  },[orders])

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 text-xs">
            Manage your profile and view your order history
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <nav className="sticky top-8">
              <ul className="space-y-2">
                {[
                  { id: "profile", label: "Profile Information", icon: "👤" },
                  { id: "orders", label: "Order History", icon: "📦" },
                ].map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-4 transition duration-200 flex items-center space-x-3 ${activeTab === tab.id
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                        }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="border border-gray-300 p-6 md:p-8">
              {activeTab === "profile" && renderProfileSection()}
              {activeTab === "orders" && renderOrderHistory()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AccountComponent);