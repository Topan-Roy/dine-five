import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Restaurant {
    id: number;
    name: string;
    rating: number;
    distance: string;
    cuisine: string;
    image: string;
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClose: () => void;
}

export const RestaurantCard = ({ restaurant, onClose }: RestaurantCardProps) => {
    return (
        <View className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl p-4 shadow-xl">
            <TouchableOpacity
                onPress={onClose}
                className="absolute top-2 right-2 z-10"
            >
                <Ionicons name="close-circle" size={24} color="#999" />
            </TouchableOpacity>

            <View className="flex-row">
                <Image
                    source={{ uri: restaurant.image }}
                    className="w-20 h-20 bg-gray-200 rounded-xl mr-3"
                    contentFit="cover"
                />

                <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-900">{restaurant.name}</Text>
                    <Text className="text-gray-600 text-sm">{restaurant.cuisine}</Text>

                    <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={16} color="#FFC107" />
                        <Text className="ml-1 text-sm font-semibold text-gray-900">{restaurant.rating}</Text>
                        <Text className="ml-2 text-gray-500 text-sm">• {restaurant.distance}</Text>
                    </View>

                    <TouchableOpacity className="bg-yellow-400 mt-2 py-2 px-4 rounded-lg">
                        <Text className="text-center font-bold text-gray-900">View Menu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
