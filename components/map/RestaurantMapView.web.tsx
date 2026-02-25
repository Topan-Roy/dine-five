// RestaurantMapView.web.tsx
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Restaurant, useRestaurantStore } from "../../stores/useRestaurantStore";

const CUISINE_FILTERS = [
  { label: "All", value: undefined },
  { label: "Bangladeshi", value: "Bangladeshi" },
  { label: "Pizza", value: "Pizza" },
  { label: "Fast Food", value: "Fast Food" },
  { label: "Chinese", value: "Chinese" },
  { label: "Thai", value: "Thai" },
  { label: "Italian", value: "Italian" },
];

// Radius steps shown in slider (meters)
const RADIUS_STEPS = [10, 50, 100, 200, 500, 1000];

const formatRadius = (meters: number): string => {
  if (meters < 100) return `${meters}m`;
  return `${(meters / 100).toFixed(1)}km`;
};

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export default function RestaurantMapView() {
  const {
    location,
    locationLoading,
    restaurants,
    restaurantsLoading,
    restaurantsError,
    selectedRestaurant,
    cuisineFilter,
    radiusMeters,
    fetchLocation,
    fetchNearbyRestaurants,
    setSelectedRestaurant,
    setCuisineFilter,
    setRadiusMeters,
  } = useRestaurantStore();

  const userLat = location?.latitude ?? 23.780704;
  const userLng = location?.longitude ?? 90.407756;
  const hasLocation = !!location && !locationLoading;

  // ─── Init location ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLocation();
  }, []);

  // ─── Fetch when location, filter, or radius changes ──────────────────────────
  useEffect(() => {
    if (!hasLocation) return;
    fetchNearbyRestaurants({
      latitude: userLat,
      longitude: userLng,
      radius: radiusMeters,
      cuisine: cuisineFilter,
      sortBy: "distance",
      page: 1,
      limit: 20,
    });
  }, [hasLocation, userLat, userLng, cuisineFilter, radiusMeters]);

  const handleRadiusChange = (value: number) => {
    // Snap to nearest step
    const nearest = RADIUS_STEPS.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    if (nearest !== radiusMeters) {
      setRadiusMeters(nearest);
      setSelectedRestaurant(null);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    if (selectedRestaurant?.providerId === restaurant.providerId) {
      setSelectedRestaurant(null);
      return;
    }
    setSelectedRestaurant(restaurant);
  };

  const goToMyLocation = () => {
    if (!location) {
      fetchLocation();
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDFBF7]">
        <ActivityIndicator size="large" color="#FFC107" />
        <Text className="mt-4 text-gray-500 text-sm">Locating you...</Text>
      </View>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (restaurantsError && restaurants.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDFBF7] px-8">
        <Ionicons name="wifi-outline" size={48} color="#D1D5DB" />
        <Text className="mt-4 text-gray-500 text-center text-sm">
          {restaurantsError}
        </Text>
        <TouchableOpacity
          onPress={() =>
            fetchNearbyRestaurants({
              latitude: userLat,
              longitude: userLng,
              radius: radiusMeters,
              cuisine: cuisineFilter,
            })
          }
          className="mt-4 bg-[#FFC107] px-6 py-3 rounded-2xl"
        >
          <Text className="font-bold text-gray-900">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-100">
      {/* ── Header ── */}
      <View className="bg-[#FFC107] pt-12 pb-3 px-4 items-center">
        <Text className="text-gray-900 font-bold text-lg">
          Nearby Restaurants
        </Text>
      </View>

      {/* ── Radius slider strip ── */}
      <View className="bg-white px-4 pt-2 pb-1 shadow-sm">
        <View className="flex-row justify-between mb-1">
          {RADIUS_STEPS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => {
                setRadiusMeters(r);
                setSelectedRestaurant(null);
              }}
            >
              <Text
                className={`text-xs font-semibold ${
                  radiusMeters === r ? "text-[#FFC107]" : "text-gray-400"
                }`}
              >
                {formatRadius(r)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Slider
          style={{ height: 28 }}
          minimumValue={RADIUS_STEPS[0]}
          maximumValue={RADIUS_STEPS[RADIUS_STEPS.length - 1]}
          value={radiusMeters}
          onSlidingComplete={handleRadiusChange}
          minimumTrackTintColor="#FFC107"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#FFC107"
        />
      </View>

      {/* ── Cuisine chips ── */}
      <View className="bg-white/90 px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {CUISINE_FILTERS.map((c) => (
              <TouchableOpacity
                key={c.label}
                onPress={() => {
                  setCuisineFilter(c.value);
                  setSelectedRestaurant(null);
                }}
                className={`px-4 py-1.5 rounded-full border ${
                  cuisineFilter === c.value
                    ? "bg-[#FFC107] border-[#FFC107]"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    cuisineFilter === c.value
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── Web notice + actions ── */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="map-outline" size={16} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              Map view is available on iOS and Android.
            </Text>
          </View>
          <TouchableOpacity
            onPress={goToMyLocation}
            className="flex-row items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full"
          >
            <Ionicons name="locate" size={14} color="#374151" />
            <Text className="text-xs font-semibold text-gray-700">
              My location
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2">
          {restaurantsLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#FFC107" />
              <Text className="text-xs text-gray-400">Searching...</Text>
            </View>
          ) : (
            <Text className="text-xs font-semibold text-gray-700">
              {restaurants.length} found within {formatRadius(radiusMeters)}
            </Text>
          )}
        </View>
      </View>

      {/* ── Restaurant list ── */}
      <ScrollView className="flex-1">
        {restaurants.map((restaurant) => {
          const isSelected =
            selectedRestaurant?.providerId === restaurant.providerId;
          return (
            <TouchableOpacity
              key={restaurant.providerId}
              onPress={() => handleRestaurantPress(restaurant)}
              className={`mx-4 mt-3 rounded-2xl border ${
                isSelected ? "border-[#FFC107] bg-amber-50" : "border-gray-100"
              }`}
            >
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-gray-900 font-bold text-sm flex-1"
                    numberOfLines={1}
                  >
                    {restaurant.restaurantName}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="navigate-outline" size={12} color="#F59E0B" />
                    <Text className="text-amber-600 text-xs font-semibold">
                      {formatDistance(restaurant.distance)}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                  {restaurant.restaurantAddress}
                </Text>
                <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                  {(Array.isArray(restaurant.cuisine) &&
                    restaurant.cuisine.length > 0 &&
                    restaurant.cuisine.join(", ")) ||
                    "Restaurant"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {restaurants.length === 0 && !restaurantsLoading && (
          <View className="items-center justify-center py-16">
            <Text className="text-gray-400 text-sm">
              No restaurants found in this area.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
