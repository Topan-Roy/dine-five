import { ViewCart } from "@/components/home/ViewCart";
import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data for hotel products
const HOTEL_PRODUCTS = [
  {
    id: 1,
    hotelId: 1,
    name: "Margherita Pizza",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500",
    isNew: false,
  },
  {
    id: 2,
    hotelId: 1,
    name: "Pepperoni Feast",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500",
    isNew: true,
  },
  {
    id: 3,
    hotelId: 1,
    name: "Cheese Burst",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    isNew: true,
  },
  {
    id: 4,
    hotelId: 2,
    name: "Chicken Curry",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
    isNew: false,
  },
  {
    id: 5,
    hotelId: 2,
    name: "Naan Bread",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=500",
    isNew: false,
  },
  {
    id: 6,
    hotelId: 1,
    name: "Veggie Supreme",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500",
    isNew: false,
  },
];

export default function HotelDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { cartCount, cartSubtotal, fetchCart } = useStore() as any;

  React.useEffect(() => {
    fetchCart();
  }, []);

  // Parse params
  const hotelId = params.id as string;
  const hotelName = (params.name as string) || "Hotel Details";
  const hotelImage = params.image as string;
  const hotelRating = params.rating as string;
  const hotelTime = params.time as string;
  const hotelDelivery = params.delivery as string;
  const hotelCategories = params.categories as string;

  const products = HOTEL_PRODUCTS.filter((item) => String(item.hotelId) === String(hotelId));

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="light" />

      {/* Fixed Background Image */}
      <View className="absolute top-0 left-0 w-full h-80 z-0">
        <Image
          source={{ uri: hotelImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-0 left-0 w-full h-full bg-black/30" />
      </View>

      {/* Fixed Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ top: insets.top + 10 }}
        className="absolute left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30 z-50"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView
        className="flex-1 z-10 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Transparent Spacer */}
        <View className="h-64 w-full" />

        <View className="bg-white rounded-t-3xl p-5 shadow-sm min-h-screen">
          {/* Hotel Info */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {hotelName}
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
              {hotelCategories}
            </Text>

            <View className="flex-row items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="font-bold text-gray-800 ml-1.5">
                  {hotelRating}
                </Text>
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

          {/* Products List Title */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">Menu items</Text>
            <View className="bg-yellow-100 px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-yellow-700">
                {products.length} Items
              </Text>
            </View>
          </View>

          {/* Products Grid */}
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
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        isNew: item.isNew.toString(),
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
                    {item.isNew && (
                      <View className="absolute top-2 left-2 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
                        <Text className="text-sm font-normal text-pink-500">
                          NEW
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-sm font-normal text-[#122511] mt-2 leading-tight">
                    {item.name}
                  </Text>

                  <View className="flex-row items-center justify-between mt-2">
                    <View className="bg-yellow-400 px-2.5 py-1 rounded-full">
                      <Text className="text-sm font-normal text-[#122511]">
                        ${item.price}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        console.log("Added to cart:", item.name);
                      }}
                      className="w-7 h-7 bg-[#FFE69C] rounded-full items-center justify-center"
                    >
                      <Ionicons name="add" size={18} color="#332701" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="w-full py-10 items-center justify-center">
                <Text className="text-gray-400">
                  No items available for this hotel.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <ViewCart count={cartCount} total={cartSubtotal} />
    </View>
  );
}
