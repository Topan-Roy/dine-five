// restaurantService.ts
import { useStore } from "./stores";

export interface Restaurant {
  providerId: string;
  restaurantName: string;
  location: { lat: number; lng: number };
  distance: number; // in km from API
  cuisine: string[];
  restaurantAddress: string;
  city: string;
  state: string;
  phoneNumber: string;
  contactEmail: string;
  profile: string; // image URL
  isVerify: boolean;
  verificationStatus: string;
  availableFoods: number;
}

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius?: number; // meters
  cuisine?: string;
  sortBy?: "distance" | "rating";
  page?: number;
  limit?: number;
}

export interface NearbyResponse {
  success: boolean;
  message: string;
  data: Restaurant[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const token = (useStore.getState() as any).accessToken;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const restaurantService = {
  /**
   * POST /provider/nearby
   * Sends JSON body to find restaurants near a coordinate.
   */
  getNearby: async (params: NearbyParams): Promise<NearbyResponse> => {
    const body: Record<string, any> = {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: (params.radius ?? 1000) / 1000, // Convert meters to km for the API
      sortBy: params.sortBy ?? "distance",
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    };

    if (params.cuisine) body.cuisine = params.cuisine;

    console.log("Nearby request payload:", JSON.stringify(body));

    try {
      const res = await fetch(`${BASE_URL}/provider/nearby`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      console.log("Nearby response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Nearby Error Response Body:", errorText);
        throw new Error(`Request failed with status ${res.status}: ${errorText}`);
      }

      const json: NearbyResponse = await res.json();
      console.log("Nearby response data:", JSON.stringify(json));

      if (!json.success) throw new Error(json.message ?? "Unknown API error");

      return json;
    } catch (error) {
      console.log("Nearby request error:", error);
      throw error;
    }
  },
};
