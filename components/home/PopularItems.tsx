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
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes((searchText || "").toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      (item.category || "")
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
            key={item.id}
            activeOpacity={0.9}
            onPress={() => {
              router.push({
                pathname: "/screens/home/product-details",
                params: {
                  id: item.id,
                  foodId: item.id,
                  name: item.name,
                  price: (item.price ?? 0).toString(),
                  image: item.image || "",
                  rating: (item.rating ?? 0).toString(),
                  reviews: "0",
                  restaurantName: item.provider || "",
                  restaurantProfile: "",
                  isFavorite: "false",
                  productDescription: item.productDescription || "",
                  providerId: item.providerID || item.providerId || "",
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
              {item.inStock === true && (
                <View className="absolute top-2 left-2 bg-yellow-400 px-2 py-0.5 rounded-full shadow-sm">
                  <Text className="text-[10px] font-bold text-[#332701]">New</Text>
                </View>
              )}
            </View>

            <Text
              numberOfLines={2}
              className="text-sm font-bold text-[#122511] mt-2 leading-tight h-8"
            >
              {item.name}
            </Text>


            <View className="flex-row items-center justify-between mt-2">
              <View className="bg-[#FFE69C] px-3 py-1 rounded-full">
                <Text className="text-sm font-bold text-[#332701]">
                  ${item.price}
                </Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onAddItem((item.price ?? 0).toString());
                }}
                className="w-8 h-8 bg-yellow-400 rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="add" size={20} color="#332701" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
