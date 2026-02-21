import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const HomeHeader = () => {
    const router = useRouter();
    const { user } = useStore() as any;

    return (
        <View className="flex-row items-center justify-between px-4 pt-3  bg-[#FDFBF7]">
            <View className="flex-row items-center gap-3">
                <Image
                    source={{
                        uri:
                            user?.profilePic ||
                            user?.photo ||
                            user?.avatar ||
                            user?.image ||
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                    }}
                    contentFit="cover"
                    style={{ width: 48, height: 48, borderRadius: 100 }}
                />
                <View>
                    <Text className="text-base font-bold text-[#1F2A33]">
                        {user?.name || user?.fullName || "Guest User"}
                    </Text>
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={14} color="#FFC107" />
                        <Text
                            numberOfLines={1}
                            className="text-xs text-gray-500 ml-1 max-w-[150px]"
                        >
                            {user?.address || "Set location"}
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => router.push("/screens/home/notifications")}
                className="w-11 h-11 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm relative"
            >
                <Ionicons name="notifications-outline" size={20} color="#333" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </TouchableOpacity>
        </View>
    );
};
