import { EmptyState } from "@/components/common/EmptyState";
import { useStore } from "@/stores/stores";
import { Product } from "@/utils/favoriteStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoriteScreen() {
    const router = useRouter();
    const {
        fetchFavorites,
        addToCart,
        removeFavorite,
        isLoading,
        foodPriceMap,
        foodDescriptionMap,
    } = useStore() as any;
    const [favorites, setFavorites] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = async () => {
        const data = await fetchFavorites();
        if (data && data.favorites) {
            setFavorites(data.favorites);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const handleToggleFavorite = async (foodId: string) => {
        const result = await removeFavorite(foodId);
        if (result) {
            // Refresh list after removing favorite
            loadFavorites();
        }
    };

    const handleAddToCart = (item: any) => {
        const product: Product = {
            id: item.food.foodId,
            name: item.food.title,
            price: (foodPriceMap[item.food.foodId] || item.food.baseRevenue || item.food.finalPriceTag).toString(),
            image: item.food.image,
            rating: item.food.averageRating || 4.7,
            reviews: item.food.totalReviews || 2500,
        };
        addToCart(product, 1);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
                router.push({
                    pathname: "/screens/home/product-details",
                    params: {
                        id: item.food.foodId || item.food._id || item.food.id,
                        foodId: item.food.foodId || item.food._id || item.food.id,
                        name:
                            item.food.name ||
                            item.food.title ||
                            item.name ||
                            item.title ||
                            "Delicious Food",
                        price: (
                            foodPriceMap[item.food.foodId] ||
                            item.food.baseRevenue ||
                            item.food.finalPriceTag ||
                            item.food.price ||
                            0
                        ).toString(),
                        image: item.food.image,
                        rating: (
                            item.food.averageRating ||
                            item.food.rating ||
                            0
                        ).toString(),
                        reviews: (
                            item.food.totalReviews ||
                            item.food.reviews ||
                            0
                        ).toString(),
                        productDescription:
                            foodDescriptionMap[item.food.foodId] ||
                            foodDescriptionMap[item.food._id] ||
                            item.food.productDescription ||
                            item.food.description ||
                            item.productDescription ||
                            item.description ||
                            "",
                        description:
                            foodDescriptionMap[item.food.foodId] ||
                            foodDescriptionMap[item.food._id] ||
                            item.food.productDescription ||
                            item.food.description ||
                            item.productDescription ||
                            item.description ||
                            "",
                        restaurantName:
                            item.food.provider ||
                            item.food.restaurantName ||
                            "",
                        providerId:
                            item.food.providerID || item.food.providerId || "",
                        serviceFee: (item.food.serviceFee || 0).toString(),
                        isFavorite: "true",
                    },
                });
            }}
            className="bg-white m-4 mb-0 rounded-3xl p-3 flex-row shadow-sm border border-gray-50"
        >
            <View className="relative">
                <Image
                    source={{ uri: item.food.image }}
                    className="w-28 h-28 rounded-2xl"
                    resizeMode="cover"
                />
            </View>

            <View className="flex-1 ml-4 justify-between">
                <View>
                    <View className="flex-row justify-between items-start">
                        <Text
                            numberOfLines={1}
                            className="text-lg font-bold text-gray-900 flex-1"
                        >
                            {item.food.name || item.food.title}
                        </Text>
                        <Text className="text-[10px] text-yellow-600 font-medium ml-2">
                            Top Rated
                        </Text>
                    </View>

                    <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={14} color="#FFC107" />
                        <Text className="text-gray-500 text-xs ml-1">
                            {item.food.averageRating || item.food.rating || 0}(
                            {item.food.totalReviews || item.food.reviews || 0})
                        </Text>
                    </View>

                    <Text className="text-xl font-bold text-gray-900 mt-2">
                        $ {foodPriceMap[item.food.foodId] || item.food.baseRevenue || item.food.finalPriceTag || item.food.price}
                    </Text>

                    <Text className="text-gray-400 text-[10px] mt-1">
                        America • Burger • Fries
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.food.foodId);
                    }}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-pink-50 rounded-full items-center justify-center shadow-sm"
                >
                    <Ionicons name="heart" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-4 py-4 flex-row items-center justify-center relative">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>

                <View className="flex-row items-center">
                    <Ionicons name="heart-outline" size={24} color="#1F2A33" />
                    <Text className="text-xl font-bold text-[#1F2A33] ml-2">
                        Favorite
                    </Text>
                </View>
            </View>

            {isLoading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FFC107" />
                </View>
            ) : favorites.length === 0 ? (
                <EmptyState
                    title="No favorites yet"
                    message="Your favorite items will appear here once you add them."
                    buttonText="Discover Foods"
                    onButtonPress={() => router.push("/(tabs)")}
                />
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.food.foodId}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            )}
        </SafeAreaView>
    );
}
