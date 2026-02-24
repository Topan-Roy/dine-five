import { ViewCart } from "@/components/home/ViewCart";
import { CustomerReviews } from "@/components/product/CustomerReviews";
import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    addFavorite,
    removeFavorite,
    addToCart,
    favorites,
    fetchFavorites,
    fetchReviewsByFoodId,
    cartCount,
    cartSubtotal,
    fetchCart
  } = useStore() as any;
  const {
    id,
    foodId,
    name,
    price,
    image,
    description,
    restaurantName,
    restaurantProfile,
  } = params;
  const productId = (id as string) || (foodId as string) || "1";

  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      const targetId = (foodId as string) || (id as string);
      if (targetId) {
        try {
          const result = await fetchReviewsByFoodId(targetId);
          if (result && result.data) {
            setReviewsData(result.data);
            setTotalReviews(result.meta?.total || result.data.length || 0);

            if (result.data.length > 0) {
              const total = result.data.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
              const avg = total / result.data.length;
              setAverageRating(parseFloat(avg.toFixed(1)));
            }
          }
        } catch (error) {
          console.log("Error loading reviews:", error);
        }
      }
    };
    loadReviews();
  }, [foodId, id]);

  const product: any = {
    id: productId,
    foodId: (foodId as string) || (id as string) || "1",
    name: (name as string) || "Delicious Food Item",
    price: (price as string) || "0.00",
    image: (image as string && (image as string).includes('http'))
      ? image
      : (image as string && (image as string).includes('base64'))
        ? image
        : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    rating: averageRating > 0 ? averageRating : (parseFloat(params.rating as string) || 0),
    reviews: totalReviews || 0,
    calories: 300,
    time: 25,
    description:
      (description as string) ||
      "Savor the rich flavors and fresh ingredients of this expertly prepared dish. Every bite is crafted to offer a perfect balance of taste and texture, ensuring a truly satisfying dining experience.",
    restaurantName: (restaurantName as string) || "The Gourmet Kitchen",
    restaurantProfile: (restaurantProfile as string) || "",
  };

  const isFav =
    favorites.includes(product.id) || favorites.includes(product.foodId);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchCart();
    if (favorites.length === 0) {
      fetchFavorites();
    }
  }, []);

  const handleToggleFavorite = async () => {
    if (isFav) {
      await removeFavorite(product.foodId);
    } else {
      await addFavorite(product.foodId);
    }
  };

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(product, quantity);
      if (result) {
        router.push("/(tabs)/card");
      } else {
        alert("Failed to add to cart. Please try again.");
      }
    } catch (error) {
      console.log("Error adding to cart:", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Floating Header Buttons */}
      <SafeAreaView className="absolute top-0 w-full z-50">
        <View className="flex-row justify-between px-6 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-11 h-11 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/20">
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="w-11 h-11 bg-black/20 backdrop-blur-md rounded-full items-center justify-center border border-white/20"
            >
              <Ionicons
                name={isFav ? "heart" : "heart-outline"}
                size={22}
                color={isFav ? "#EF4444" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Product Image Section - Inside ScrollView */}
        <View className="h-[45vh] w-full bg-gray-200">
          <Image
            source={{ uri: product.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/5" />

          {/* Pagination Dots */}
          <View className="absolute bottom-12 w-full flex-row justify-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-[#FFC107]" />
            <View className="w-2.5 h-2.5 rounded-full bg-white/60" />
            <View className="w-2.5 h-2.5 rounded-full bg-white/60" />
          </View>
        </View>

        {/* Info Card Container */}
        <View className="flex-1 bg-white -mt-8 rounded-t-[32px] px-6 pt-8 pb-32">
          {/* Stats Bar */}
          <View className="flex-row items-center justify-around py-4 border border-[#F2F4F7] rounded-xl mb-6 shadow-sm bg-white">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text className="text-sm font-bold text-[#1F2A33]">
                {product.rating}
              </Text>
              <Text className="text-xs text-[#7A7A7A]">Reviews</Text>
            </View>
            <View className="w-[1px] h-4 bg-[#F2F4F7]" />
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="flame" size={18} color="#F97316" />
              <Text className="text-sm font-medium text-[#7A7A7A]">
                {product.calories}kcal
              </Text>
            </View>
            <View className="w-[1px] h-4 bg-[#F2F4F7]" />
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time" size={18} color="#24B5D4" />
              <Text className="text-sm font-medium text-[#7A7A7A]">
                {product.time}mins
              </Text>
            </View>
          </View>

          {/* Title & Quantity */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[20px] font-bold text-[#1F2A33] flex-1 mr-4">
              {product.name}
            </Text>
            <View className="flex-row items-center bg-transparent">
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity((q) => q - 1)}
                className="w-10 h-10 items-center justify-center bg-[#FFF3CD] rounded-full"
              >
                <Ionicons name="remove" size={20} color="#332701" />
              </TouchableOpacity>
              <Text className="mx-4 text-lg font-bold text-[#1F2A33]">
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 items-center justify-center bg-[#FFF3CD] rounded-full"
              >
                <Ionicons name="add" size={20} color="#332701" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text className="text-[#7A7A7A] text-[15px] leading-6 mb-8">
            {isExpanded || product.description.length <= 150
              ? product.description
              : `${product.description.substring(0, 150)}...`}
            {product.description.length > 150 && (
              <Text
                onPress={() => setIsExpanded(!isExpanded)}
                className="text-[#FFC107] font-bold"
              >
                {isExpanded ? " See less" : " Read more..."}
              </Text>
            )}
          </Text>

          {/* Price & Add Button */}
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-3xl font-bold text-[#1F2A33]">
              ${product.price}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleAddToCart}
                className="bg-[#FFE69C] px-6 py-4 rounded-2xl"
              >
                <Text className="text-[#332701] font-bold text-base">
                  Add to card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddToCart}
                className="bg-yellow-400 px-8 py-4 rounded-2xl shadow-md"
              >
                <Text className="text-[#1F2A33] font-bold text-base">
                  Buy now
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer Reviews Section */}
          <CustomerReviews reviews={reviewsData} />
        </View>
      </ScrollView>

      <ViewCart count={cartCount} total={cartSubtotal} />
    </View>
  );
}
