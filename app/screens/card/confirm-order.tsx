import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useStore } from '@/stores/stores';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmOrderScreen() {
    const router = useRouter();
    const { fetchCart, updateCartQuantity, removeCartItem } = useStore() as any;
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState(0);

    const loadCart = async (showLoading = true) => {
        const cartData = await fetchCart();
        if (cartData && cartData.items) {
            const formattedItems = cartData.items.map((item: any) => ({
                id: item.foodId._id || item.foodId.id || item._id, // Cart Item ID or Food ID depending on API
                cartItemId: item._id, // Actual item ID in cart array
                name: item.foodId.title || item.foodId.name,
                price: item.price,
                image: item.foodId.image,
                quantity: item.quantity,
                foodId: item.foodId._id // Keep reference to foodId
            }));
            setCartItems(formattedItems);
            setSubtotal(cartData.subtotal || 0);
        } else {
            setCartItems([]);
            setSubtotal(0);
        }
    };

    React.useEffect(() => {
        loadCart();
    }, []);

    const handleUpdateQuantity = async (foodId: string, cartItemId: string, delta: number, currentQuantity: number) => {
        const newQuantity = currentQuantity + delta;

        // Optimistic Update
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.cartItemId === cartItemId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );

        try {
            if (newQuantity <= 0) {
                await removeCartItem(foodId);
            } else {
                await updateCartQuantity(foodId, newQuantity);
            }
            await loadCart(false);
        } catch (error) {
            console.log("Error updating quantity:", error);
            await loadCart(false);
        }
    };

    const deliveryFee = 3.99;
    const total = subtotal + deliveryFee;

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
                        key={item.cartItemId || item.id}
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        image={item.image}
                        quantity={item.quantity}
                        onIncrement={() => handleUpdateQuantity(item.foodId, item.cartItemId, 1, item.quantity)}
                        onDecrement={() => handleUpdateQuantity(item.foodId, item.cartItemId, -1, item.quantity)}
                        onRemove={() => handleUpdateQuantity(item.foodId, item.cartItemId, -item.quantity, item.quantity)}
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
