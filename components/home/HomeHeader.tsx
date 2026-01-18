import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const HomeHeader = () => {
    const router = useRouter();
    return (
        <View className="flex-row items-center justify-between px-4 pt-3  bg-[#FDFBF7]">
            <View className="flex-row items-center gap-3">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }}
                    contentFit='cover'
                    style={{ width: 40, height: 40, borderRadius: 100 }}
                />
                <View>
                    <Text className="text-base font-normal text-[#1F2A33]">Maria's Kitchen</Text>
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text className="text-sm text-[#666] ml-1">Madhavaram Milk colony...</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => router.push('/screens/home/notifications')}
                className="w-11 h-11 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm relative">
                <Ionicons name="notifications-outline" size={20} color="#333" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </TouchableOpacity>
        </View>
    );
};
