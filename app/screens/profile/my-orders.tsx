import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ORDERS = {
    current: [
        {
            id: 1,
            status: 'Preparing',
            time: 'Ready in  25mins',
            items: [{ name: 'Margherita Pizza', qty: 1 }],
            total: '5.99',
            image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=150',
            state: 'preparing' // for logic if needed
        },
        {
            id: 2,
            status: 'Ready for pickup',
            time: 'Ready in  25mins', // maybe "Pickup now" ? keeping text from image if possible, image says "Ready in 25mins" for preparing, and "Ready in 25mins" for pickup? That seems like a typo in design or static frame. I'll use "Pickup now" for logic validity or stick to image text.
            // Image 2nd card says "Ready for pickup" title, and subtext "Ready in 25mins". This implies it was ready in 25 mins or is ready.
            items: [{ name: 'Margherita Pizza', qty: 1 }],
            total: '5.99',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150',
            state: 'pickup'
        },
        {
            id: 3,
            status: 'Preparing',
            time: 'Ready in  25mins',
            items: [{ name: 'Margherita Pizza', qty: 1 }],
            total: '5.99',
            image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=150',
            state: 'preparing'
        }
    ],
    previous: [
        {
            id: 4,
            status: 'Order Completed',
            time: 'Picked up on  26 October',
            items: [{ name: 'Margherita Pizza', qty: 1 }],
            total: '5.99',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150',
            state: 'completed'
        },
        {
            id: 5,
            status: 'Order Completed',
            time: 'Picked up on  26 October',
            items: [{ name: 'Margherita Pizza', qty: 1 }],
            total: '5.99',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150',
            state: 'completed'
        },
        {
            id: 6,
            status: 'Order Completed',
            time: 'Picked up on  26 October',
            items: [{ name: 'Margherita Pizza', qty: 1 }],
            total: '5.99',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150',
            state: 'completed'
        }
    ]
};

export default function MyOrdersScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">My Orders</Text>
            </View>

            {/* Tabs */}
            <View className="px-6 mb-6">
                <View className="flex-row bg-[#FFE69C] bg-opacity-20 rounded-xl p-1 h-14 items-center">
                    <TouchableOpacity
                        onPress={() => setActiveTab('current')}
                        className={`flex-1 h-full items-center justify-center rounded-xl relative ${activeTab === 'current' ? 'bg-[#FFC107]' : 'bg-transparent'}`}>
                        <Text className={`text-base font-semibold ${activeTab === 'current' ? 'text-gray-900' : 'text-gray-600'}`}>Current</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('previous')}
                        className={`flex-1 h-full items-center justify-center rounded-xl ${activeTab === 'previous' ? 'bg-[#FFC107]' : 'bg-transparent'}`}>
                        <Text className={`text-base font-semibold ${activeTab === 'previous' ? 'text-gray-900' : 'text-gray-600'}`}>Previous</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {ORDERS[activeTab].map((order) => (
                    <View key={order.id} className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row mb-4">
                            <Image
                                source={{ uri: order.image }}
                                className="w-20 h-20 rounded-xl"
                                resizeMode="cover"
                            />
                            <View className="flex-1 ml-3">
                                <Text className="text-base font-bold text-gray-900 mb-0.5">{order.status}</Text>
                                <Text className="text-xs text-gray-500 mb-2">{order.time}</Text>

                                {order.items.map((item, idx) => (
                                    <View key={idx} className="flex-row justify-between mb-0.5">
                                        <Text className="text-xs text-gray-600">Order summary</Text>
                                        <Text className="text-xs font-semibold text-gray-900">{item.name} x{item.qty}</Text>
                                    </View>
                                ))}

                                <View className="flex-row justify-between mt-1">
                                    <Text className="text-xs text-gray-600">Total price paid</Text>
                                    <Text className="text-xs font-bold text-gray-900">${order.total}</Text>
                                </View>
                            </View>
                        </View>

                        {activeTab === 'current' ? (
                            <TouchableOpacity className="border border-gray-200 py-3 rounded-xl items-center">
                                <Text className="text-gray-900 font-bold text-sm">View Progress</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="flex-1 border border-gray-200 py-3 rounded-xl items-center">
                                    <Text className="text-gray-900 font-bold text-sm">Reorder</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="w-12 items-center justify-center border border-gray-200 rounded-xl">
                                    {/* Simple Plus or similar icon from image */}
                                    <Ionicons name="add" size={20} color="#000" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

        </SafeAreaView>
    );
}
