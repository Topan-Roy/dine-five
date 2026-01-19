import { ViewCart } from "@/components/home/ViewCart";
import { CustomerReviews } from "@/components/product/CustomerReviews";
import { favoriteStore, Product } from "@/utils/favoriteStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name, price, image, description } = params;

  const product: Product = {
    id: (id as string) || "1",
    name: (name as string) || "Pepperoni Cheese Pizza",
    price: (price as string) || "5.99",
    image:
      (image as string) ||
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    rating: 4.8,
    reviews: 300,
    calories: 300,
    time: 25,
    description:
      (description as string) ||
      "A classic favorite! Indulge in a crispy, thin crust topped with rich tomato sauce, layers of gooey mozzarella cheese, and delicious pepperoni slices. Perfectly baked with a hint of herbs for a mouth-watering experience in every bite.",
  };

  const [isFav, setIsFav] = useState(favoriteStore.isFavorite(product.id));
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsub = favoriteStore.subscribe(() => {
      setIsFav(favoriteStore.isFavorite(product.id));
    });
    return unsub;
  }, [product.id]);

  const handleToggleFavorite = () => {
    favoriteStore.toggleFavorite(product);
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + quantity);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Fixed Background Image */}
      <View className="absolute top-0 w-full h-[45vh]">
        <Image
          source={{ uri: product.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Overlay gradient can be added here if text contrast needed */}
        <View className="absolute w-full h-full bg-black/10" />
      </View>

      {/* Fixed Header Actions */}
      <SafeAreaView className="absolute top-0 w-full z-50">
        <View className="flex-row justify-between px-4 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30">
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30"
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={20}
                color={isFav ? "#EF4444" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Spacer to push content down below the visible image area */}
        <View className="h-[40vh]" />

        {/* White Content Container */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-32 min-h-screen">
          {/* Stats Row */}
          <View className="flex-row justify-between mb-6 border border-[#E3E6F0] rounded-lg p-3 bg-white shadow-sm">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text className="text-sm font-normal text-[#7A7A7A]">
                {product.rating} Reviews
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="flame" size={16} color="#F97316" />
              <Text className="text-sm font-normal text-[#7A7A7A]">
                {product.calories}kcal
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="time" size={16} color="#24B5D4" />
              <Text className="text-sm font-normal text-[#7A7A7A]">
                {product.time}mins
              </Text>
            </View>
          </View>

          {/* Title & Quantity */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-medium text-[#363A33] w-[60%]">
              {product.name}
            </Text>
            <View className="flex-row items-center  rounded-full px-2 py-1">
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity((q) => q - 1)}
                className="w-10 h-10 items-center justify-center bg-[#FFF3CD] rounded-full"
              >
                <Text className="text-lg font-bold text-[#332701]">-</Text>
              </TouchableOpacity>
              <Text className="mx-4 text-lg font-medium text-[#1F2A33]">
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                className="w-10 h-10  items-center justify-center bg-[#FFF3CD] rounded-full"
              >
                <Text className="text-lg font-bold text-[#332701]">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text className="text-[#7A7A7A] text-sm font-normal leading-6 mb-8">
            {product.description}
            <Text className="text-[#363A33] font-bold"> Read more...</Text>
          </Text>

          {/* Price & Add Button */}
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-2xl font-semibold text-[#363A33]">
              ${product.price}
            </Text>
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-yellow-400 px-8 py-4 rounded-2xl shadow-md"
            >
              <Text className="text-[#1F2A33] font-medium text-base">
                Add to card
              </Text>
            </TouchableOpacity>
          </View>

          {/* Customer Reviews */}
          <CustomerReviews />
        </View>
      </ScrollView>

      <ViewCart count={quantity} total={quantity * parseFloat(product.price)} />
    </View>
  );
}
