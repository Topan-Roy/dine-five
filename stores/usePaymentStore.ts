import { create } from "zustand";
import { useStore } from "./stores";

export interface PaymentMethod {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
  cardType?: string;
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (data: Omit<PaymentMethod, "id">) => Promise<boolean>;
}

const getBaseUrl = () => {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/payment-methods`;
  console.log("Payment API BASE_URL:", url);
  return url;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = (useStore.getState() as any).accessToken;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  paymentMethods: [],
  isLoading: false,
  error: null,

  fetchPaymentMethods: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(getBaseUrl(), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      console.log("fetchPaymentMethods full result:", JSON.stringify(result, null, 2));
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch payment methods");
      }

      // Handle both { data: [...] } and directly [...]
      const methods = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
      set({ paymentMethods: methods, isLoading: false });
    } catch (error: any) {
        console.error("fetchPaymentMethods error:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  addPaymentMethod: async (data) => {
    set({ isLoading: true, error: null });
    console.log("Adding payment method payload:", JSON.stringify(data, null, 2));
    try {
      const response = await fetch(getBaseUrl(), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Add payment method success result:", JSON.stringify(result, null, 2));
      if (!response.ok) {
        throw new Error(result.message || "Failed to add payment method");
      }

      // Refresh the list after adding
      await get().fetchPaymentMethods();
      return true;
    } catch (error: any) {
        console.error("addPaymentMethod error:", error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));
