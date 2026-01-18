import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export const PopularHotels = () => {
    return (
        <View className="px-4 mt-4">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-medium text-[#1F2A33]">Popular hotels</Text>
                <TouchableOpacity>
                    <Text className="text-yellow-500 font-medium text-sm">See all</Text>
                </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500' }}
                    className="w-full h-40 rounded-xl mb-3"
                    resizeMode="cover"
                />
                <Text className="text-lg font-bold text-gray-900 mb-1">Silver Inn</Text>
                <View className="flex-row items-center mb-3">
                    <Text className="text-gray-500 text-xs">Thai food • Thai food • Thai food</Text>
                </View>

                <View className="flex-row items-center gap-2 border-t border-gray-100 pt-3">
                    <View className="flex-row items-center">
                        <Ionicons name="star" size={16} color="#F59E0B" />
                        <Text className="text-xs font-bold text-gray-700 ml-1">4.2</Text>
                    </View>
                    <Text> • </Text>
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text className="text-xs text-gray-500 ml-1">32 min</Text>
                    </View>
                    <Text> • </Text>
                    <View className="flex-row items-center">
                        <Ionicons name="bicycle-outline" size={16} color="#6B7280" />
                        <Text className="text-xs text-gray-500 ml-1">Free</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
