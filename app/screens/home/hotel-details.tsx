import { ViewCart } from "@/components/home/ViewCart";
import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HotelProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  isNew: boolean;
  productDescription?: string;
  providerId?: string;
  rating?: number;
  reviews?: number;
};

// Fallback data when provider feed is unavailable
const HOTEL_PRODUCTS: HotelProduct[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
    isNew: false,
  },
  {
    id: "2",
    name: "Pepperoni Feast",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
    isNew: true,
  },
  {
    id: "3",
    name: "Cheese Burst",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    isNew: true,
  },
];

const mapFeedToHotelProduct = (item: any, providerId?: string): HotelProduct => {
  const price = Number(item?.finalPriceTag ?? item?.price ?? 0);
  const safePrice = Number.isFinite(price) ? price.toFixed(2) : "0.00";

  return {
    id: String(item?.id || item?._id || Math.random().toString(36).slice(2)),
    name: item?.name || item?.title || "Food item",
    price: safePrice,
    image:
      item?.image ||
      item?.foodImage ||
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    isNew: Boolean(item?.inStock),
    productDescription: item?.productDescription || item?.description || "",
    providerId: item?.providerID || item?.providerId || providerId || "",
    rating: Number(item?.rating || 0),
    reviews: Number(item?.totalReviews || 0),
  };
};

export default function HotelDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { cartCount, cartSubtotal, fetchCart, addToCart, cartItems } = useStore() as any;

  const [products, setProducts] = React.useState<HotelProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);

  React.useEffect(() => {
    fetchCart();
  }, []);

  const hotelName = (params.name as string) || "Hotel Details";
  const hotelImage = params.image as string;
  const hotelRating = (params.rating as string) || "4.5";
  const hotelTime = (params.time as string) || "25 min";
  const hotelDelivery = (params.delivery as string) || "Free";
  const hotelCategories = (params.categories as string) || "Restaurant";
  const providerId = (params.providerId as string) || "";

  React.useEffect(() => {
    let active = true;

    const loadProviderFoods = async () => {
      setLoadingProducts(true);

      try {
        if (!providerId) {
          if (active) {
            setProducts(HOTEL_PRODUCTS);
          }
          return;
        }

        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/feed?providerId=${providerId}&page=1&limit=50`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to load provider foods");
        }

        const result = await res.json();
        const feed = Array.isArray(result?.data) ? result.data : [];

        if (!active) return;

        if (!feed.length) {
          setProducts([]);
          return;
        }

        setProducts(feed.map((item: any) => mapFeedToHotelProduct(item, providerId)));
      } catch {
        if (active) {
          setProducts(HOTEL_PRODUCTS);
        }
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    };

    loadProviderFoods();
    return () => {
      active = false;
    };
  }, [providerId]);

  const isItemInCart = (itemId: string) => {
    if (!itemId) return false;
    return (cartItems || []).some((cartItem: any) => {
      const cartFoodId = cartItem?.foodId?._id || cartItem?.foodId?.id || cartItem?.foodId || cartItem?._id;
      return String(cartFoodId) === String(itemId);
    });
  };

  const handleAddItem = async (item: any) => {
    const inCart = isItemInCart(item.id);
    if (inCart) {
      router.push("/card");
      return;
    }
    await addToCart(item, 1);
  };

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 w-full h-80 z-0">
        <Image source={{ uri: hotelImage }} className="w-full h-full" resizeMode="cover" />
        <View className="absolute top-0 left-0 w-full h-full bg-black/30" />
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        style={{ top: insets.top + 10 }}
        className="absolute left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30 z-50"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView className="flex-1 z-10" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="h-64 w-full" />

        <View className="bg-white rounded-t-3xl p-5 shadow-sm min-h-screen">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">{hotelName}</Text>
            <Text className="text-gray-500 text-sm mb-4">{hotelCategories}</Text>

            <View className="flex-row items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="font-bold text-gray-800 ml-1.5">{hotelRating}</Text>
              </View>
              <View className="w-[1px] h-4 bg-gray-300" />
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text className="text-gray-600 ml-1.5">{hotelTime}</Text>
              </View>
              <View className="w-[1px] h-4 bg-gray-300" />
              <View className="flex-row items-center">
                <Ionicons name="bicycle-outline" size={20} color="#6B7280" />
                <Text className="text-gray-600 ml-1.5">{hotelDelivery}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">Menu items</Text>
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-yellow-700">{products.length} Items</Text>
            </View>
          </View>

          {loadingProducts ? (
            <View className="w-full py-10 items-center justify-center">
              <ActivityIndicator size="small" color="#FFC107" />
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.length > 0 ? (
                products.map((item) => (
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
                          price: item.price,
                          image: item.image,
                          rating: String(item.rating || 0),
                          reviews: String(item.reviews || 0),
                          restaurantName: hotelName,
                          restaurantProfile: hotelImage,
                          productDescription: item.productDescription || "",
                          providerId: item.providerId || providerId,
                          isNew: String(item.isNew ?? false),
                        },
                      });
                    }}
                    className="w-[48%] mt-4 bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100"
                  >
                    <View className="relative">
                      <Image source={{ uri: item.image }} className="w-full h-32 rounded-xl" resizeMode="cover" />
                      {item.isNew === true && (
                        <View className="absolute top-2 left-2 bg-yellow-400 px-2.5 py-1 rounded-full  shadow-sm">
                          <Text className="text-[10px] font-bold text-[#332701]">New</Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-sm font-normal text-[#122511] mt-2 leading-tight" numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View className="flex-row items-center justify-between mt-2">
                      <View className="bg-yellow-400 px-2.5 py-1 rounded-full">
                        <Text className="text-sm font-normal text-[#122511]">${item.price}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAddItem(item);
                        }}
                        className={`w-7 h-7 ${isItemInCart(item.id) ? 'bg-green-500' : 'bg-[#FFE69C]'} rounded-full items-center justify-center`}
                      >
                        <Ionicons name={isItemInCart(item.id) ? "cart" : "add"} size={18} color={isItemInCart(item.id) ? "#fff" : "#332701"} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="w-full py-10 items-center justify-center">
                  <Text className="text-gray-400">No items available for this hotel.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <ViewCart count={cartCount} total={cartSubtotal} />
    </View>
  );
}
