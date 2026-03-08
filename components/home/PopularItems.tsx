import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const PopularItems = ({
  onAddItem,
  searchText = "",
  activeCategory = "All",
  refreshKey = 0,
}: {
  onAddItem: (item: any) => void;
  searchText?: string;
  activeCategory?: string;
  refreshKey?: number;
}) => {
  const router = useRouter();
  const { fetchFeed, cartItems } = useStore() as any;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      if (items.length === 0) setLoading(true);
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
  }, [fetchFeed, refreshKey]);

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

  const isItemInCart = (itemId: string) => {
    if (!itemId) return false;
    return (cartItems || []).some((cartItem: any) => {
      const cartFoodId = cartItem?.foodId?._id || cartItem?.foodId?.id || cartItem?.foodId || cartItem?._id;
      return String(cartFoodId) === String(itemId);
    });
  };

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
        {filteredItems.map((item, index) => {
          const inCart = isItemInCart(item.id || item._id);

          // Use exactly the same logic as the working Product Details page
          const rawImage = item.image || item.foodImage || "";
          const safeImageUrl = rawImage.startsWith("http://")
            ? rawImage.replace("http://", "https://")
            : rawImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";

          return (
            <TouchableOpacity
              key={item.id || item._id || index}
              activeOpacity={0.9}
              onPress={() => {
                if (inCart) {
                  router.push("/card");
                  return;
                }
                router.push({
                  pathname: "/screens/home/product-details",
                  params: {
                    id: String(item.id || item._id || ""),
                    foodId: String(item.id || item._id || ""),
                    name: String(item.name || ""),
                    price: String(item.baseRevenue || item.price || 0),
                    image: String(item.image || ""),
                    rating: String(item.rating || 0),
                    reviews: "0",
                    restaurantName: String(item.provider || ""),
                    restaurantProfile: "",
                    isFavorite: "false",
                    productDescription: String(item.productDescription || ""),
                    providerId: String(item.providerID || item.providerId || ""),
                    serviceFee: String(item.serviceFee || 0),
                  },
                });
              }}
              className="w-[48%] mt-4 bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100"
            >
              <View className="relative bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  source={{ uri: safeImageUrl }}
                  style={{ width: '100%', height: 128, borderRadius: 12 }}
                  contentFit="cover"
                  transition={500}
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
                    ${item.baseRevenue || item.price}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (inCart) {
                      router.push("/card");
                      return;
                    }
                    onAddItem(item);
                  }}
                  className={`w-8 h-8 ${inCart ? 'bg-green-500' : 'bg-yellow-400'} rounded-full items-center justify-center shadow-sm`}
                >
                  <Ionicons name={inCart ? "cart" : "add"} size={20} color={inCart ? "#fff" : "#332701"} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

