import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const HOTELS = [
    {
        id: 1,
        name: 'Silver Inn',
        rating: '4.2',
        time: '32 min',
        delivery: 'Free',
        categories: 'Thai food • Thai food • Thai food',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'
    },
    // Adding another dummy hotel for search demonstration
    {
        id: 2,
        name: 'The Golden Spoon',
        rating: '4.5',
        time: '25 min',
        delivery: '$2.00',
        categories: 'Indian • Curry • Spacious',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'
    }
];

export const PopularHotels = ({ searchText = '' }: { searchText?: string }) => {
    const filteredHotels = HOTELS.filter(hotel =>
        hotel.name.toLowerCase().includes(searchText.toLowerCase())
    );

    if (searchText && filteredHotels.length === 0) return null;

    return (
        <View className="px-4 mt-4">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-medium text-[#1F2A33]">Popular hotels</Text>
                <TouchableOpacity>
                    <Text className="text-yellow-500 font-medium text-sm">See all</Text>
                </TouchableOpacity>
            </View>

            {filteredHotels.map((hotel) => (
                <View key={hotel.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4">
                    <Image
                        source={{ uri: hotel.image }}
                        className="w-full h-40 rounded-xl mb-3"
                        resizeMode="cover"
                    />
                    <Text className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</Text>
                    <View className="flex-row items-center mb-3">
                        <Text className="text-gray-500 text-xs">{hotel.categories}</Text>
                    </View>

                    <View className="flex-row items-center gap-2 border-t border-gray-100 pt-3">
                        <View className="flex-row items-center">
                            <Ionicons name="star" size={16} color="#F59E0B" />
                            <Text className="text-xs font-bold text-gray-700 ml-1">{hotel.rating}</Text>
                        </View>
                        <Text> • </Text>
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">{hotel.time}</Text>
                        </View>
                        <Text> • </Text>
                        <View className="flex-row items-center">
                            <Ionicons name="bicycle-outline" size={16} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">{hotel.delivery}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};
