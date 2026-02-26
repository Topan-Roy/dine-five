import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useStore } from '@/stores/stores';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmOrderScreen() {
    const router = useRouter();
    const { fetchCart, updateCartQuantity, removeCartItem } =
        useStore() as any;

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState(0);

    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState<'COD' | 'CARD'>(
        'COD'
    );

    const loadCart = async () => {
        const cartData = await fetchCart();
        if (cartData && cartData.items) {
            const formattedItems = cartData.items.map((item: any) => ({
                id: item.foodId?._id || item._id,
                cartItemId: item._id,
                name: item.foodId?.title || item.foodId?.name,
                price: item.price,
                image: item.foodId?.image,
                quantity: item.quantity,
                foodId:
                    item.foodId?._id || item.foodId?.id || item.foodId,
            }));

            setCartItems(formattedItems);
            setSubtotal(cartData.subtotal || 0);
        } else {
            setCartItems([]);
            setSubtotal(0);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleUpdateQuantity = async (
        foodId: string,
        cartItemId: string,
        delta: number,
        currentQuantity: number
    ) => {
        const newQuantity = currentQuantity + delta;

        setCartItems(prev =>
            prev
                .map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
                .filter(item => item.quantity > 0)
        );

        try {
            if (newQuantity <= 0) {
                await removeCartItem(foodId);
            } else {
                await updateCartQuantity(foodId, newQuantity);
            }
            await loadCart();
        } catch (err) {
            console.log(err);
            await loadCart();
        }
    };

    const applyCoupon = () => {
        if (coupon.trim().toLowerCase() === 'save10') {
            const discountAmount = subtotal * 0.1;
            setDiscount(discountAmount);
            Alert.alert('Success', 'Coupon Applied (10% Discount)');
        } else {
            setDiscount(0);
            Alert.alert('Invalid Coupon');
        }
    };

    const platformFee = 3.99;
    const total = subtotal + platformFee - discount;

    const handleContinue = () => {
        if (!cartItems.length) {
            Alert.alert('Cart Empty');
            return;
        }

        router.push({
            pathname: '/screens/card/checkout',
            params: {
                total,
                paymentMethod: selectedPayment,
                discount,
            },
        });
    };

    if (cartItems.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#FDFBF7]">
                <EmptyState
                    title="Your cart is empty!"
                    message="Add items to continue"
                    buttonText="Explore"
                    onButtonPress={() => router.push('/(tabs)')}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 w-10 h-10 bg-white rounded-full items-center justify-center">
                    <Ionicons name="chevron-back" size={22} />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Confirm Order</Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 200 }}>
                {cartItems.map(item => (
                    <CartItem
                        key={item.cartItemId}
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        image={item.image}
                        quantity={item.quantity}
                        onIncrement={() =>
                            handleUpdateQuantity(
                                item.foodId,
                                item.cartItemId,
                                1,
                                item.quantity
                            )
                        }
                        onDecrement={() =>
                            handleUpdateQuantity(
                                item.foodId,
                                item.cartItemId,
                                -1,
                                item.quantity
                            )
                        }
                        onRemove={() =>
                            handleUpdateQuantity(
                                item.foodId,
                                item.cartItemId,
                                -item.quantity,
                                item.quantity
                            )
                        }
                    />
                ))}

                {/* Coupon Section */}
                <View className="mt-6">
                    <Text className="font-semibold mb-2">Coupon Code</Text>
                    <View className="flex-row">
                        <TextInput
                            value={coupon}
                            onChangeText={setCoupon}
                            placeholder="Enter coupon"
                            className="flex-1 bg-white px-4 py-3 rounded-l-xl border"
                        />
                        <TouchableOpacity
                            onPress={applyCoupon}
                            className="bg-black px-4 justify-center rounded-r-xl">
                            <Text className="text-white font-bold">Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Payment Method */}
                <View className="mt-6">
                    <Text className="font-semibold mb-3">Payment Method</Text>

                    <TouchableOpacity
                        onPress={() => setSelectedPayment('COD')}
                        className={`p-4 rounded-xl mb-3 ${selectedPayment === 'COD'
                                ? 'bg-yellow-200'
                                : 'bg-white'
                            }`}>
                        <Text>Cash on Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedPayment('CARD')}
                        className={`p-4 rounded-xl ${selectedPayment === 'CARD'
                                ? 'bg-yellow-200'
                                : 'bg-white'
                            }`}>
                        <Text>Card Payment</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary */}
                <View className="mt-8">
                    <View className="flex-row justify-between">
                        <Text>Subtotal</Text>
                        <Text>${subtotal.toFixed(2)}</Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text>Platform Fee</Text>
                        <Text>${platformFee.toFixed(2)}</Text>
                    </View>

                    {discount > 0 && (
                        <View className="flex-row justify-between">
                            <Text>Discount</Text>
                            <Text>- ${discount.toFixed(2)}</Text>
                        </View>
                    )}

                    <View className="flex-row justify-between mt-3 border-t pt-3">
                        <Text className="font-bold text-lg">Total</Text>
                        <Text className="font-bold text-lg">
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-16 left-0 right-0 px-4 py-5 bg-[#FDFBF7] border-t flex-row justify-between items-center">
                <Text className="text-2xl font-bold">
                    ${total.toFixed(2)}
                </Text>
                <TouchableOpacity
                    onPress={handleContinue}
                    className="bg-yellow-400 px-10 py-4 rounded-2xl">
                    <Text className="font-bold text-lg">Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}