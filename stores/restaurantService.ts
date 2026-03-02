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

const normalizeRestaurant = (item: any): Restaurant | null => {
  const lat = Number(item?.location?.lat);
  const lng = Number(item?.location?.lng);

  // Native map crashes easily on invalid coordinates. Drop bad records.
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const providerId = String(item?.providerId || item?._id || "").trim();
  if (!providerId) {
    return null;
  }

  const distance = Number(item?.distance);
  const availableFoods = Number(item?.availableFoods);

  return {
    providerId,
    restaurantName: String(item?.restaurantName || "Restaurant"),
    location: { lat, lng },
    distance: Number.isFinite(distance) ? distance : 0,
    cuisine: Array.isArray(item?.cuisine) ? item.cuisine.filter(Boolean).map(String) : [],
    restaurantAddress: String(item?.restaurantAddress || ""),
    city: String(item?.city || ""),
    state: String(item?.state || ""),
    phoneNumber: String(item?.phoneNumber || ""),
    contactEmail: String(item?.contactEmail || ""),
    profile: String(item?.profile || ""),
    isVerify: Boolean(item?.isVerify),
    verificationStatus: String(item?.verificationStatus || "ACTIVE"),
    availableFoods: Number.isFinite(availableFoods) ? availableFoods : 0,
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

    const json = (await res.json()) as NearbyResponse;

    if (!json.success) {
      throw new Error(json.message ?? "Unknown API error");
    }

    const normalized = (Array.isArray(json.data) ? json.data : [])
      .map(normalizeRestaurant)
      .filter((x): x is Restaurant => Boolean(x));

    return {
      ...json,
      data: normalized,
      pagination: {
        total: json.pagination?.total ?? normalized.length,
        page: json.pagination?.page ?? 1,
        limit: json.pagination?.limit ?? normalized.length,
      },
    };
  },
};
