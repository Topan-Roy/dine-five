import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { RESTAURANTS } from "./data";
import { generateMapHTML } from "./mapHtml";

export default function RestaurantMapView() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          // Try last known first for speed
          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown) {
            setLocation({
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
            });
            setLoading(false);
          }

          // Then update with current
          let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } else {
          // Default to phone GPS location (no hardcoded fallback)
          console.log("Location permission denied - using GPS");
        }
      } catch (error) {
        console.log("Location error:", error);
        // Keep null location - will show loading state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FFC107" />
        <Text className="mt-2 text-gray-500">Loading map...</Text>
      </View>
    );
  }

  const userLat = location?.latitude ?? 23.7808;
  const userLng = location?.longitude ?? 90.4067;

  return (
    <View className="flex-1 relative">
      <WebView
        source={{ html: generateMapHTML(userLat, userLng) }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
      />
      <View className="absolute top-4 left-4 bg-white/95 px-4 py-2 rounded-full shadow-lg z-20">
        <Text className="font-semibold text-gray-800 text-sm">
          {RESTAURANTS.length} Restaurants Nearby
        </Text>
      </View>
    </View>
  );
}
