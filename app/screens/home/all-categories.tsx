import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllCategoriesScreen() {
    const router = useRouter();
    const { fetchCategories } = useStore() as any;
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error loading categories:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    const getRandomColor = (index: number) => {
        const colors = ["#FFC107", "#FF5722", "#E91E63", "#2196F3", "#4CAF50", "#9C27B0"];
        return colors[index % colors.length];
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center px-4 py-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 ml-4">All Categories</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFC107" />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            className="flex-1 m-2 bg-white p-6 rounded-2xl items-center justify-center shadow-sm border border-gray-50"
                            onPress={() => {
                                router.push({
                                    pathname: "/(tabs)",
                                    params: { category: item.categoryName }
                                });
                            }}
                        >
                            <View
                                style={{ backgroundColor: getRandomColor(index) + '15' }}
                                className="w-20 h-20 rounded-full items-center justify-center mb-4 overflow-hidden"
                            >
                                {item.image ? (
                                    <Image
                                        source={{ uri: item.image }}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <Ionicons
                                        name="fast-food"
                                        size={32}
                                        color={getRandomColor(index)}
                                    />
                                )}
                            </View>
                            <Text
                                numberOfLines={1}
                                className="text-sm font-semibold text-gray-800 text-center"
                            >
                                {item.categoryName}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
