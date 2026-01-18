import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_CART = [
    {
        id: 1,
        name: 'Cheese Burst Pizza',
        price: '5.99',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        quantity: 1
    },
    {
        id: 2,
        name: 'Cheese Burst Pizza',
        price: '5.99',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        quantity: 1
    },
    {
        id: 3,
        name: 'Cheese Burst Pizza',
        price: '5.99',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        quantity: 3
    },
    {
        id: 4,
        name: 'Cheese Burst Pizza',
        price: '5.99',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        quantity: 1
    }
];

export default function ConfirmOrderScreen() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState(INITIAL_CART);

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(items => {
            return items.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: item.quantity + delta };
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const total = subtotal + 3.99;

    if (cartItems.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#FDFBF7]">
                <StatusBar style="dark" />
                <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <EmptyState
                    title="Your cart is empty!"
                    message="Explore and add items to the cart to show here..."
                    buttonText="Explore"
                    onButtonPress={() => router.push('/(tabs)')}
                />
            </SafeAreaView>
        );
    }

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
                <Text className="text-xl font-bold text-gray-900">Conform Order</Text>
            </View>

            {/* List */}
            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 160 }}
            >
                {cartItems.map((item) => (
                    <CartItem
                        key={item.id}
                        {...item}
                        onIncrement={() => updateQuantity(item.id, 1)}
                        onDecrement={() => updateQuantity(item.id, -1)}
                    />
                ))}

                {/* Summary Section within scroll to appear at bottom of list */}
                <View className="mt-8 mb-4">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 text-base">Subtotal</Text>
                        <Text className="text-gray-900 font-bold text-base">${subtotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between pt-2 border-t border-gray-200">
                        <Text className="text-gray-900 text-lg font-bold">Total</Text>
                        <Text className="text-gray-900 text-lg font-bold">${total.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="absolute bottom-16 left-0 right-0 bg-[#FDFBF7] px-4 py-6 border-t border-gray-100 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</Text>
                <TouchableOpacity
                    onPress={() => router.push('/screens/card/checkout')}
                    className="bg-yellow-400 px-10 py-4 rounded-2xl shadow-md">
                    <Text className="text-gray-900 font-bold text-lg">Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
