"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/rootReducer";
import { DeliveryInfo, PaymentMethod, BillingInfo, ShippingMethod } from "@/redux/interfaces/orderInterface";
import { clearError, clearSuccess, createOrderFail, createOrderRequest, createOrderSuccess } from "@/redux/reducers/orderReducer";
import Axios from "@/components/Axios";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function OrderPage() {
  const dispatch = useDispatch();
  const { data: session } = useSession();


  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const { orderItems } = useSelector((state: RootState) => state.orderItems);
  const { success, error, loading } = useSelector((state: RootState) => state.order);

  // Delivery Information
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    firstName: "",
    lastName: "",
    country: "Bangladesh",
    streetAddress: "",
    apartment: "",
    city: "",
    district: "",
    postcode: "",
    phone: "",
    email: "",
    password: "",
    orderNotes: "",
  });

  // Billing Information
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    sameAsDelivery: true,
    firstName: "",
    lastName: "",
    streetAddress: "",
    apartment: "",
    city: "",
    district: "",
    postcode: "",
    phone: "",
    email: "",
  });

  // Shipping Methods with fees in BDT
  const shippingMethods: ShippingMethod[] = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "5-7 business days",
      fee: 80,
      estimatedDelivery: "5-7 days",
    },
    {
      id: "fast",
      name: "Fast Delivery",
      description: "2-3 business days",
      fee: 150,
      estimatedDelivery: "2-3 days",
    },
    {
      id: "regular",
      name: "Regular Delivery",
      description: "7-10 business days",
      fee: 50,
      estimatedDelivery: "7-10 days",
    },
  ];

  // Payment Methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cod",
      name: "Cash on Delivery",
      type: "cod",
    },
    {
      id: "bkash",
      name: "bKash",
      type: "mobile",
      details: {
        provider: "bKash",
      },
    },
    {
      id: "nagad",
      name: "Nagad",
      type: "mobile",
      details: {
        provider: "Nagad",
      },
    },
    {
      id: "rocket",
      name: "Rocket",
      type: "mobile",
      details: {
        provider: "Rocket",
      },
    },
    {
      id: "dutch",
      name: "Dutch Bangla Bank",
      type: "bank",
      details: {
        provider: "Dutch Bangla Bank",
      },
    },
    {
      id: "city",
      name: "City Bank",
      type: "bank",
      details: {
        provider: "City Bank",
      },
    },
    {
      id: "brac",
      name: "BRAC Bank",
      type: "bank",
      details: {
        provider: "BRAC Bank",
      },
    },
  ];

  // State Management
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cod");
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [mobilePaymentDetails, setMobilePaymentDetails] = useState({
    accountNumber: "",
    transactionId: "",
  });
  const [bankPaymentDetails, setBankPaymentDetails] = useState({
    accountNumber: "",
    transactionId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Calculate Order Totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const shippingFee = shippingMethods.find((method) => method.id === selectedShippingMethod)?.fee || 0;
  const tax = subtotal * 0.05; // 5% VAT for Bangladesh
  const total = subtotal + shippingFee + tax;

  // Handle Delivery Info Changes
  const handleDeliveryInfoChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle Billing Info Changes
  const handleBillingInfoChange = (field: keyof BillingInfo, value: string | boolean) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate Form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!deliveryInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!deliveryInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!deliveryInfo.streetAddress.trim()) errors.streetAddress = "Street address is required";
    if (!deliveryInfo.city.trim()) errors.city = "City is required";
    if (!deliveryInfo.district.trim()) errors.district = "District is required";
    if (!deliveryInfo.postcode.trim()) errors.postcode = "Postcode is required";
    if (!deliveryInfo.phone.trim()) errors.phone = "Phone number is required";
    if (!deliveryInfo.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(deliveryInfo.email)) errors.email = "Email is invalid";
    
    // Billing validation if different
    if (useDifferentBilling) {
      if (!billingInfo.firstName.trim()) errors.billingFirstName = "First name is required";
      if (!billingInfo.lastName.trim()) errors.billingLastName = "Last name is required";
      if (!billingInfo.streetAddress.trim()) errors.billingStreetAddress = "Street address is required";
      if (!billingInfo.city.trim()) errors.billingCity = "City is required";
      if (!billingInfo.district.trim()) errors.billingDistrict = "District is required";
      if (!billingInfo.postcode.trim()) errors.billingPostcode = "Postcode is required";
      if (!billingInfo.phone.trim()) errors.billingPhone = "Phone number is required";
      if (!billingInfo.email.trim()) errors.billingEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(billingInfo.email)) errors.billingEmail = "Email is invalid";
    }

    // Mobile payment validation
    if (selectedPaymentMethod === "bkash" || selectedPaymentMethod === "nagad" || selectedPaymentMethod === "rocket") {
      if (!mobilePaymentDetails.accountNumber.trim()) errors.mobileAccount = "Account number is required";
      if (!mobilePaymentDetails.transactionId.trim()) errors.mobileTransaction = "Transaction ID is required";
    }

    // Bank payment validation
    if (selectedPaymentMethod === "dutch" || selectedPaymentMethod === "city" || selectedPaymentMethod === "brac") {
      if (!bankPaymentDetails.accountNumber.trim()) errors.bankAccount = "Account number is required";
      if (!bankPaymentDetails.transactionId.trim()) errors.bankTransaction = "Transaction ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    // Find the selected shipping and payment methods
    const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingMethod);
    const selectedPayment = paymentMethods.find((m) => m.id === selectedPaymentMethod);

    if (!selectedShipping || !selectedPayment) {
      toast.error("Please select shipping and payment methods");
      return;
    }

    // Prepare the order data matching backend schema
    const orderData: any = {
      user: isAuthenticated && user ? user._id : null,
      shippingInfo: {
        firstName: deliveryInfo.firstName,
        lastName: deliveryInfo.lastName,
        country: deliveryInfo.country,
        streetAddress: deliveryInfo.streetAddress,
        apartment: deliveryInfo.apartment || "",
        city: deliveryInfo.city,
        district: deliveryInfo.district,
        postcode: deliveryInfo.postcode,
        phone: deliveryInfo.phone,
        email: deliveryInfo.email,
        password: !isAuthenticated ? deliveryInfo.password : undefined, // Only send password for new users
        orderNotes: deliveryInfo.orderNotes || "",
      },
      orderItems: orderItems.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        thumbnail: item.thumbnail,
        // Don't send total - backend calculates it
      })),
      shippingMethod: {
        id: selectedShipping.id,
        name: selectedShipping.name,
        description: selectedShipping.description,
        fee: selectedShipping.fee,
        estimatedDelivery: selectedShipping.estimatedDelivery,
      },
      paymentMethod: {
        id: selectedPayment.id,
        name: selectedPayment.name,
        type: selectedPayment.type,
        details: selectedPayment.details || {},
      },
      currency: "BDT",
      notes: deliveryInfo.orderNotes || "",
      taxRate: 0.05, // 5% tax rate
    };

    // Add billing info
    if (useDifferentBilling) {
      orderData.billingInfo = {
        sameAsDelivery: false,
        firstName: billingInfo.firstName,
        lastName: billingInfo.lastName,
        streetAddress: billingInfo.streetAddress,
        apartment: billingInfo.apartment || "",
        city: billingInfo.city,
        district: billingInfo.district,
        postcode: billingInfo.postcode,
        phone: billingInfo.phone,
        email: billingInfo.email,
      };
    } else {
      orderData.billingInfo = { sameAsDelivery: true };
    }

    // Add payment details based on payment method
    if (selectedPayment.type === 'mobile') {
      // Find which mobile payment provider is selected
      const provider = selectedPayment.id as "bkash" | "nagad" | "rocket";

      orderData.mobilePayment = {
        mobileNumber: mobilePaymentDetails.accountNumber,
        transactionId: mobilePaymentDetails.transactionId,
        provider: provider,
        amount: total, // Send the total amount
        paymentTime: new Date().toISOString(),
      };
    }

    if (selectedPayment.type === 'bank') {
      // Find which bank is selected
      const bankName = selectedPayment.id as "dutch" | "city" | "brac";

      orderData.bankPayment = {
        bankName: bankName,
        accountNumber: bankPaymentDetails.accountNumber,
        transactionId: bankPaymentDetails.transactionId,
        amount: total, // Send the total amount
      };
    }

    try {
      dispatch(createOrderRequest());
      const token = session?.user?.id || "";
      console.log(token)


      const { data } = await Axios.post("/order/create", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      dispatch(createOrderSuccess(data));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create order";
      dispatch(createOrderFail(errorMessage));
    }
  };
  // Bangladesh Districts
  const bangladeshDistricts = [
    "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh",
    "Comilla", "Noakhali", "Jessore", "Narayanganj", "Gazipur", "Bogra", "Dinajpur", "Pabna",
    "Tangail", "Kushtia", "Jhenaidah", "Magura", "Meherpur", "Narail", "Chuadanga", "Kurigram",
    "Sherpur", "Moulvibazar", "Habiganj", "Sunamganj", "Netrokona", "Jamalpur", "Sirajganj",
    "Narsingdi", "Munshiganj", "Manikganj", "Faridpur", "Gopalganj", "Madaripur", "Shariatpur",
    "Natore", "Chapainawabganj", "Naogaon", "Joypurhat", "Pirojpur", "Barguna", "Bhola",
    "Lakshmipur", "Feni", "Chandpur", "Cox's Bazar", "Bandarban", "Rangamati", "Khagrachhari",
  ];

  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setDeliveryInfo((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if(success){
      toast.success(success);
      // Clear cart and order items
      localStorage.removeItem("cart");
      localStorage.removeItem("orderItems");

    }
    if(error){ 
      toast.error(error);
    }

    dispatch(clearSuccess())
    dispatch(clearError())
  },[success, error])



  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          {/* Inner spinning ring */}
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>

          {/* Optional logo or text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <p className="absolute mt-24 text-gray-600 font-medium">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Order Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase securely</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Order Form */}
            <div className="lg:w-2/3">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6 pb-4 border-b border-gray-300">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Information
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-800 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.firstName}
                      onChange={(e) => handleDeliveryInfoChange("firstName", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                        formErrors.firstName ? "border-red-500" : "border-gray-400"
                      }`}
                      placeholder="John"
                      
                    />
                    {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.lastName}
                      onChange={(e) => handleDeliveryInfoChange("lastName", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                        formErrors.lastName ? "border-red-500" : "border-gray-400"
                      }`}
                      placeholder="Doe"
                      
                    />
                    {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={deliveryInfo.phone}
                      onChange={(e) => handleDeliveryInfoChange("phone", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                        formErrors.phone ? "border-red-500" : "border-gray-400"
                      }`}
                      placeholder="01XXXXXXXXX"
                    />
                    {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleDeliveryInfoChange("email", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                        formErrors.email ? "border-red-500" : "border-gray-400"
                      }`}
                      placeholder="john@example.com"
                      disabled={isAuthenticated}
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6 pb-4 border-b border-gray-300">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Delivery Information
                  </span>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-800 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deliveryInfo.country}
                      onChange={(e) => handleDeliveryInfoChange("country", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Other">Other Country</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.streetAddress}
                      onChange={(e) => handleDeliveryInfoChange("streetAddress", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                        formErrors.streetAddress ? "border-red-500" : "border-gray-400"
                      }`}
                      placeholder="House 123, Road 456"
                    />
                    {formErrors.streetAddress && <p className="mt-1 text-sm text-red-600">{formErrors.streetAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2">Apartment, suite, etc. (Optional)</label>
                    <input
                      type="text"
                      value={deliveryInfo.apartment || ""}
                      onChange={(e) => handleDeliveryInfoChange("apartment", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition"
                      placeholder="Apartment, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-800 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.city}
                        onChange={(e) => handleDeliveryInfoChange("city", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                          formErrors.city ? "border-red-500" : "border-gray-400"
                        }`}
                        placeholder="Dhaka"
                      />
                      {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-800 mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={deliveryInfo.district}
                        onChange={(e) => handleDeliveryInfoChange("district", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                          formErrors.district ? "border-red-500" : "border-gray-400"
                        }`}
                      >
                        <option value="">Select District</option>
                        {bangladeshDistricts.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      {formErrors.district && <p className="mt-1 text-sm text-red-600">{formErrors.district}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-800 mb-2">
                        Postcode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.postcode}
                        onChange={(e) => handleDeliveryInfoChange("postcode", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                          formErrors.postcode ? "border-red-500" : "border-gray-400"
                        }`}
                        placeholder="1200"
                      />
                      {formErrors.postcode && <p className="mt-1 text-sm text-red-600">{formErrors.postcode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2">Order Notes (Optional)</label>
                    <textarea
                      value={deliveryInfo.orderNotes || ""}
                      onChange={(e) => handleDeliveryInfoChange("orderNotes", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition resize-none"
                      rows={3}
                      placeholder="Special instructions for delivery, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6 pb-4 border-b border-gray-300">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" />
                    </svg>
                    Shipping Method
                  </span>
                </h2>

                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedShippingMethod === method.id ? "border-black bg-gray-100" : "border-gray-300 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={selectedShippingMethod === method.id}
                          onChange={(e) => setSelectedShippingMethod(e.target.value)}
                          className="w-4 h-4 text-black"
                        />
                        <div className="ml-3">
                          <span className="font-medium text-black">{method.name}</span>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-black">{method.fee}৳</span>
                        <p className="text-sm text-gray-600">{method.estimatedDelivery}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6 pb-4 border-b border-gray-300">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </span>
                </h2>

                <div className="space-y-6">
                  {/* Cash on Delivery */}
                  <div>
                    <h3 className="font-semibold text-black mb-3">Cash on Delivery</h3>
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-600">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={selectedPaymentMethod === "cod"}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-black"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-black">Cash on Delivery</span>
                        <p className="text-sm text-gray-600">Pay when you receive the product</p>
                      </div>
                    </label>
                  </div>

                  {/* Mobile Payment */}
                  <div>
                    <h3 className="font-semibold text-black mb-3">Mobile Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {paymentMethods.filter((method) => method.type === "mobile").map((method) => (
                        <label
                          key={method.id}
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id ? "border-black bg-gray-100" : "border-gray-300 hover:border-gray-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="w-10 h-10 mb-2">
                            {method.id === "bkash" && (
                              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold">bK</div>
                            )}
                            {method.id === "nagad" && (
                              <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">N</div>
                            )}
                            {method.id === "rocket" && (
                              <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">R</div>
                            )}
                          </div>
                          <span className="font-medium text-black text-sm">{method.name}</span>
                        </label>
                      ))}
                    </div>

                    {/* Mobile Payment Details */}
                    {(selectedPaymentMethod === "bkash" || selectedPaymentMethod === "nagad" || selectedPaymentMethod === "rocket") && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={mobilePaymentDetails.accountNumber}
                              onChange={(e) => setMobilePaymentDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.mobileAccount ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="01XXXXXXXXX"
                            />
                            {formErrors.mobileAccount && <p className="mt-1 text-sm text-red-600">{formErrors.mobileAccount}</p>}
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={mobilePaymentDetails.transactionId}
                              onChange={(e) => setMobilePaymentDetails((prev) => ({ ...prev, transactionId: e.target.value }))}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.mobileTransaction ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="TRX123456789"
                            />
                            {formErrors.mobileTransaction && <p className="mt-1 text-sm text-red-600">{formErrors.mobileTransaction}</p>}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          Please make the payment to our {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name} account and enter the details above.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bank Payment */}
                  <div>
                    <h3 className="font-semibold text-black mb-3">Bank Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {paymentMethods.filter((method) => method.type === "bank").map((method) => (
                        <label
                          key={method.id}
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === method.id ? "border-black bg-gray-100" : "border-gray-300 hover:border-gray-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="w-10 h-10 mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <span className="font-medium text-black text-sm">{method.name}</span>
                        </label>
                      ))}
                    </div>

                    {/* Bank Payment Details */}
                    {(selectedPaymentMethod === "dutch" || selectedPaymentMethod === "city" || selectedPaymentMethod === "brac") && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={bankPaymentDetails.accountNumber}
                              onChange={(e) => setBankPaymentDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.bankAccount ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="123456789"
                            />
                            {formErrors.bankAccount && <p className="mt-1 text-sm text-red-600">{formErrors.bankAccount}</p>}
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={bankPaymentDetails.transactionId}
                              onChange={(e) => setBankPaymentDetails((prev) => ({ ...prev, transactionId: e.target.value }))}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.bankTransaction ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="TRX123456789"
                            />
                            {formErrors.bankTransaction && <p className="mt-1 text-sm text-red-600">{formErrors.bankTransaction}</p>}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          Please make the payment to our {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name} account and enter the details above.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                <h2 className="text-xl font-bold text-black mb-6 pb-4 border-b border-gray-300">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Billing Address
                  </span>
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-600">
                    <input
                      type="radio"
                      checked={!useDifferentBilling}
                      onChange={() => {
                        setUseDifferentBilling(false);
                        setBillingInfo((prev) => ({ ...prev, sameAsDelivery: true }));
                      }}
                      className="w-4 h-4 text-black"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-black">Same as delivery address</span>
                      <p className="text-sm text-gray-600">Use the delivery address for billing</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-600">
                    <input
                      type="radio"
                      checked={useDifferentBilling}
                      onChange={() => {
                        setUseDifferentBilling(true);
                        setBillingInfo((prev) => ({ ...prev, sameAsDelivery: false }));
                      }}
                      className="w-4 h-4 text-black"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-black">Use a different billing address</span>
                      <p className="text-sm text-gray-600">Enter a different address for billing</p>
                    </div>
                  </label>

                  {useDifferentBilling && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
                      <h3 className="font-semibold text-black mb-4">Billing Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-800 mb-2">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.firstName}
                              onChange={(e) => handleBillingInfoChange("firstName", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingFirstName ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="John"
                            />
                            {formErrors.billingFirstName && <p className="mt-1 text-sm text-red-600">{formErrors.billingFirstName}</p>}
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.lastName}
                              onChange={(e) => handleBillingInfoChange("lastName", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingLastName ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="Doe"
                            />
                            {formErrors.billingLastName && <p className="mt-1 text-sm text-red-600">{formErrors.billingLastName}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-800 mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={billingInfo.streetAddress}
                            onChange={(e) => handleBillingInfoChange("streetAddress", e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                              formErrors.billingStreetAddress ? "border-red-500" : "border-gray-400"
                            }`}
                            placeholder="House 123, Road 456"
                          />
                          {formErrors.billingStreetAddress && <p className="mt-1 text-sm text-red-600">{formErrors.billingStreetAddress}</p>}
                        </div>

                        <div>
                          <label className="block text-gray-800 mb-2">Apartment, suite, etc. (Optional)</label>
                          <input
                            type="text"
                            value={billingInfo.apartment || ""}
                            onChange={(e) => handleBillingInfoChange("apartment", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition"
                            placeholder="Apartment, floor, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-800 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.city}
                              onChange={(e) => handleBillingInfoChange("city", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingCity ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="Dhaka"
                            />
                            {formErrors.billingCity && <p className="mt-1 text-sm text-red-600">{formErrors.billingCity}</p>}
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">
                              District <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={billingInfo.district}
                              onChange={(e) => handleBillingInfoChange("district", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingDistrict ? "border-red-500" : "border-gray-400"
                              }`}
                            >
                              <option value="">Select District</option>
                              {bangladeshDistricts.map((district) => (
                                <option key={district} value={district}>{district}</option>
                              ))}
                            </select>
                            {formErrors.billingDistrict && <p className="mt-1 text-sm text-red-600">{formErrors.billingDistrict}</p>}
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Postcode <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={billingInfo.postcode}
                              onChange={(e) => handleBillingInfoChange("postcode", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingPostcode ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="1200"
                            />
                            {formErrors.billingPostcode && <p className="mt-1 text-sm text-red-600">{formErrors.billingPostcode}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={billingInfo.phone}
                              onChange={(e) => handleBillingInfoChange("phone", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingPhone ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="01XXXXXXXXX"
                            />
                            {formErrors.billingPhone && <p className="mt-1 text-sm text-red-600">{formErrors.billingPhone}</p>}
                          </div>
                          <div>
                            <label className="block text-gray-800 mb-2">
                              Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={billingInfo.email}
                              onChange={(e) => handleBillingInfoChange("email", e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition ${
                                formErrors.billingEmail ? "border-red-500" : "border-gray-400"
                              }`}
                              placeholder="john@example.com"
                            />
                            {formErrors.billingEmail && <p className="mt-1 text-sm text-red-600">{formErrors.billingEmail}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Order Button */}
              <div className="sticky bottom-0 bg-white rounded-lg border border-gray-300 p-6">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-4 bg-black text-white font-bold text-lg rounded-lg hover:bg-gray-800 transition-all duration-300 shadow hover:shadow-lg"
                >
                  Complete Order • {total}৳
                </button>
                <p className="text-center text-gray-600 text-sm mt-3">
                  By completing your order, you agree to our{" "}
                  <a href="/terms" className="text-black hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-black hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
                  <h2 className="text-xl font-bold text-black mb-6 pb-4 border-b border-gray-300">
                    Order Summary
                  </h2>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center pb-4 border-b border-gray-200">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-black">{item.title}</h3>
                          {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Qty: {item.quantity}</span>
                              <span className="text-gray-400">×</span>
                              <span className="font-medium">{item.price}৳</span>
                            </div>
                            <span className="font-bold text-black">{item.total}৳</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{subtotal}৳</span>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <span className="text-gray-600">Shipping</span>
                        <p className="text-xs text-gray-500">
                          {shippingMethods.find((m) => m.id === selectedShippingMethod)?.name}
                        </p>
                      </div>
                      <span className="font-medium">{shippingFee}৳</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (5% VAT)</span>
                      <span className="font-medium">{tax.toFixed(0)}৳</span>
                    </div>

                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex justify-between text-lg font-bold text-black">
                        <span>Total</span>
                        <span>{total}৳</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">In Bangladeshi Taka (BDT)</p>
                    </div>
                  </div>

                  {/* Payment Method Display */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
                    <h3 className="font-semibold text-black mb-2">Selected Payment</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {selectedPaymentMethod === "cod" && (
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {(selectedPaymentMethod === "bkash" || selectedPaymentMethod === "nagad" || selectedPaymentMethod === "rocket") && (
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                        {(selectedPaymentMethod === "dutch" || selectedPaymentMethod === "city" || selectedPaymentMethod === "brac") && (
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-black">
                        {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Help & Support */}
                <div className="bg-gray-50 rounded-lg border border-gray-300 p-6">
                  <h3 className="font-bold text-black mb-4">Need Help?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-black mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="font-medium text-black">Call Us</p>
                        <p className="text-gray-600">+880 1234 567890</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-black mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-black">Email Us</p>
                        <p className="text-gray-600">support@example.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return to Cart */}
                <div className="mt-6">
                  <Link href="/cart" className="flex items-center justify-center gap-2 text-black hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Return to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}