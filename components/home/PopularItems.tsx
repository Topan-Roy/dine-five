import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const PopularItems = ({
  onAddItem,
  searchText = "",
  activeCategory = "All",
}: {
  onAddItem: (price: string) => void;
  searchText?: string;
  activeCategory?: string;
}) => {
  const router = useRouter();
  const { fetchFeed } = useStore() as any;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      const data = await fetchFeed();
      if (Array.isArray(data)) {
        setItems(data);
        if (data.length > 0) {
          console.log("Popular Item Sample:", JSON.stringify(data[0], null, 2));
        }
      } else {
        setItems([]);
      }
      setLoading(false);
    };
    loadFeed();
  }, [fetchFeed]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes((searchText || "").toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      (item.categoryName || "")
        .toLowerCase()
        .includes((activeCategory || "").toLowerCase());

    return !!(matchesSearch && matchesCategory);
  });

  if (loading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  if (searchText && filteredItems.length === 0) return null;

  return (
    <View className="px-4">
      <View className="flex-row flex-wrap justify-between">
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.foodId}
            activeOpacity={0.9}
            onPress={() => {
              router.push({
                pathname: "/screens/home/product-details",
                params: {
                  id: item._id || item.id || item.foodId,
                  foodId: item.foodId || item._id || item.id,
                  name: item.title,
                  price: (item.finalPriceTag ?? 0).toString(),
                  image: item.image || "",
                  rating: (item.averageRating ?? 0).toString(),
                  reviews: (item.totalReviews ?? 0).toString(),
                  restaurantName: item.provider?.restaurantName || "",
                  restaurantProfile: item.provider?.profile || "",
                  isFavorite: (item.favoriteCount > 0).toString(),
                },
              });
            }}
            className="w-[48%] mt-4 bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100"
          >
            <View className="relative">
              <Image
                source={{ uri: item.image }}
                className="w-full h-32 rounded-xl"
                resizeMode="cover"
              />
              {!item.foodAvailability && (
                <View className="absolute top-2 left-2 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                  <Text className="text-sm font-normal text-gray-500">OUT</Text>
                </View>
              )}
            </View>

            <Text
              numberOfLines={2}
              className="text-sm font-normal text-[#122511] mt-2 leading-tight h-8"
            >
              {item.title}
            </Text>

            <View className="flex-row items-center justify-between mt-2">
              <View className="bg-yellow-400 px-2.5 py-1 rounded-full">
                <Text className="text-sm font-normal text-[#122511]">
                  ${item.finalPriceTag}
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onAddItem((item.finalPriceTag ?? 0).toString());
                }}
                className="w-7 h-7 bg-[#FFE69C] rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={18} color="#332701" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
