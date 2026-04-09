export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  account: string;
  authentication: {
    password: string;
    sessionToken: string;
  };
  image?: {
    public_id: string;
    url: string;
  };
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: {
    _id: string;
    type: "shipping" | "billing" | "both";
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    label: "home" | "work" | "other";
  };
  billingAddress: {
    _id: string;
    type: "shipping" | "billing" | "both";
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    label: "home" | "work" | "other";
  };
  paymentMethod: {
    _id: string;
    type: string;
    provider: string;
    lastFourDigits: string;
    expiryDate: string;
    isDefault: boolean;
    billingAddress: {
      _id: string;
      type: "shipping" | "billing" | "both";
      fullName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      label: "home" | "work" | "other";
    };
  };
  orders?: Array<{
    _id: string;
    items: Array<{
      productName: string;
      variantId: string;
      quantity: number;
      price: number;
      status: "delivered" | "cancelled" | "returned";
    }>;
    totalAmount: number;
    orderDate: Date;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    shippingAddress: {
      _id: string;
      type: "shipping" | "billing" | "both";
      fullName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      label: "home" | "work" | "other";
    };
    billingAddress: {
      _id: string;
      type: "shipping" | "billing" | "both";
      fullName: string;
      phoneNumber: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      label: "home" | "work" | "other";
    };
    paymentMethod: {
      _id: string;
      type: string;
      provider: string;
      lastFourDigits: string;
      expiryDate: string;
      isDefault: boolean;
      billingAddress: {
        _id: string;
        type: "shipping" | "billing" | "both";
        fullName: string;
        phoneNumber: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isDefault: boolean;
        label: "home" | "work" | "other";
      };
    };
    trackingNumber?: string;
    estimatedDelivery?: Date;
  }>;
  returns?: Array<{
    _id: string;
    returnId: string;
    orderId: string;
    items: Array<{
      productId: string;
      reason: "wrong_item" | "defective" | "size_issue";
      status: "requested" | "approved" | "refunded";
    }>;
    returnDate: Date;
    refundAmount: number;
  }>;
}

export interface UserState {
  isAuthenticated: boolean;
  status: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
  success: string | null;
}