import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useStore } from '@/stores/stores';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PricingBreakdown = {
    subtotal: number;
    platformFee: number;
    stateTax: number;
    textFee: number;
    total: number;
    city: string;
    state: string;
};

export default function ConfirmOrderScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        buyNow?: string;
        foodId?: string;
        name?: string;
        price?: string;
        image?: string;
        quantity?: string;
        providerId?: string;
        serviceFee?: string;
    }>();

    const {
        fetchCart,
        updateCartQuantity,
        removeCartItem,
        createPaymentIntent,
        foodProviderMap,
        foodServiceFeeMap,
        foodPriceMap,
        userState,
        stateTaxInfo,
        fetchStateTax,
        updateUserLocation,
    } = useStore() as any;

    const isBuyNow = params.buyNow === 'true';

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [pricing, setPricing] = useState<PricingBreakdown>({
        subtotal: 0,
        platformFee: 0,
        stateTax: 0,
        textFee: 0,
        total: 0,
        city: 'Unknown State',
        state: 'Unknown State',
    });
    const [isPricingLoading, setIsPricingLoading] = useState(false);

    const buyNowBaseItem = useMemo(() => {
        if (!isBuyNow || !params.foodId) return null;
        const qty = Math.max(1, Number(params.quantity || 1));
        const foodIdStr = String(params.foodId);
        const price = foodPriceMap[foodIdStr] || Number(params.price || 0);
        return {
            id: foodIdStr,
            cartItemId: foodIdStr,
            foodId: foodIdStr,
            name: String(params.name || 'Product'),
            price,
            image: String(params.image || ''),
            quantity: qty,
            providerId: String(params.providerId || ''),
            serviceFee: parseFloat(params.serviceFee || '0') || foodServiceFeeMap[foodIdStr] || 0,
        };
    }, [isBuyNow, params.foodId, params.quantity, params.price, params.name, params.image, params.providerId, params.serviceFee, foodServiceFeeMap, foodPriceMap]);

    const loadPricing = async (
        providerId: string,
        itemsForPaymentIntent: { foodId: string; quantity: number; serviceFee?: number; price?: number }[],
        fallbackSubtotal: number
    ) => {
        if (!providerId || !itemsForPaymentIntent.length) {
            setPricing((prev) => ({
                ...prev,
                subtotal: fallbackSubtotal,
                total: fallbackSubtotal,
            }));
            return;
        }

        setIsPricingLoading(true);
        try {
            const paymentIntentResult = await createPaymentIntent({
                providerId,
                items: itemsForPaymentIntent,
            });
            const breakdown = paymentIntentResult?.data?.breakdown;

            if (breakdown) {
                setPricing({
                    subtotal: fallbackSubtotal, // Use client-side 5.99 based subtotal
                    platformFee: Number(breakdown.platformFee || 0),
                    stateTax: Number(breakdown.stateTax || 0),
                    textFee: Number(breakdown.textFee || 0),
                    total: (fallbackSubtotal + Number(breakdown.platformFee || 0) + Number(breakdown.stateTax || 0)),
                    city: breakdown.city || 'Unknown State',
                    state: breakdown.state || 'Unknown State',
                });
            } else {
                setPricing((prev) => ({
                    ...prev,
                    subtotal: fallbackSubtotal,
                    total: fallbackSubtotal,
                }));
            }
        } finally {
            setIsPricingLoading(false);
        }
    };

    const loadCart = async () => {
        if (isBuyNow) {
            if (!buyNowBaseItem) {
                setCartItems([]);
                setSubtotal(0);
                return;
            }

            const localSubtotal = Number((buyNowBaseItem.price * buyNowBaseItem.quantity).toFixed(2));
            setCartItems([buyNowBaseItem]);
            setSubtotal(localSubtotal);

            const providerId = buyNowBaseItem.providerId || foodProviderMap?.[buyNowBaseItem.foodId] || '';
            await loadPricing(
                providerId,
                [{
                    foodId: buyNowBaseItem.foodId,
                    quantity: buyNowBaseItem.quantity,
                    serviceFee: buyNowBaseItem.serviceFee || 0,
                    price: buyNowBaseItem.price
                }],
                localSubtotal
            );
            return;
        }

        const cartData = await fetchCart();
        if (cartData && cartData.items) {
            const formattedItems = cartData.items.map((item: any) => {
                const foodId = item.foodId?._id || item.foodId?.id || item.foodId;
                return {
                    id: item.foodId?._id || item._id,
                    cartItemId: item._id,
                    name: item.foodId?.title || item.foodId?.name,
                    image: item.foodId?.image,
                    quantity: item.quantity,
                    foodId: foodId,
                    providerId:
                        item.providerID ||
                        item.foodId?.providerID ||
                        item.providerId ||
                        item.foodId?.providerId ||
                        item.foodId?.provider?._id ||
                        '',
                    price: foodPriceMap[foodId] || item.price || item.foodId?.price || 0,
                    serviceFee:
                        item.foodId?.serviceFee ||
                        item.serviceFee ||
                        item.foodId?.platformFee ||
                        item.platformFee ||
                        foodServiceFeeMap[foodId] ||
                        0,
                };
            });

            setCartItems(formattedItems);
            const localSubtotal = Number(cartData.subtotal || 0);
            setSubtotal(localSubtotal);

            const first = formattedItems[0];
            const providerId = first?.providerId || foodProviderMap?.[first?.foodId] || '';
            const itemsForPaymentIntent = formattedItems.map((item: any) => ({
                foodId: item.foodId,
                quantity: item.quantity,
                serviceFee: item.serviceFee || 0,
                price: item.price
            }));

            await loadPricing(providerId, itemsForPaymentIntent, localSubtotal);
        } else {
            setCartItems([]);
            setSubtotal(0);
        }
    };

    useEffect(() => {
        loadCart();
    }, [isBuyNow, params.foodId, params.quantity]);

    useEffect(() => {
        if (userState) {
            fetchStateTax(userState);
        } else {
            updateUserLocation();
        }
    }, [userState]);

    const handleUpdateQuantity = async (
        foodId: string,
        cartItemId: string,
        delta: number,
        currentQuantity: number
    ) => {
        const newQuantity = currentQuantity + delta;

        if (isBuyNow) {
            if (newQuantity <= 0) {
                setCartItems([]);
                setSubtotal(0);
                return;
            }

            const updated = cartItems.map(item =>
                item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
            );
            setCartItems(updated);

            const item = updated[0];
            const localSubtotal = Number((item.price * item.quantity).toFixed(2));
            setSubtotal(localSubtotal);
            const providerId = item.providerId || foodProviderMap?.[item.foodId] || '';
            await loadPricing(providerId, [{ foodId: item.foodId, quantity: item.quantity }], localSubtotal);
            return;
        }

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

    const calculatedServiceFee = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + (Number(item.serviceFee || 0) * item.quantity), 0);
    }, [cartItems]);

    const displayServiceFee = calculatedServiceFee || pricing.platformFee;
    const displayStateTax = stateTaxInfo?.tax ? (subtotal * Number(stateTaxInfo.tax) / 100) : (pricing.stateTax || 0);

    useEffect(() => {
        console.log("Tax Debug Info:", {
            userState,
            taxRate: stateTaxInfo?.tax,
            subtotal,
            calculatedTax: displayStateTax
        });
    }, [userState, stateTaxInfo, subtotal, displayStateTax]);

    const total = (subtotal + displayServiceFee + displayStateTax);

    const handleContinue = () => {
        if (!cartItems.length) {
            Alert.alert('Cart Empty');
            return;
        }

        if (isBuyNow) {
            const item = cartItems[0];
            const pid = item.providerId || foodProviderMap?.[item.foodId] || '';
            router.push({
                pathname: '/screens/card/checkout',
                params: {
                    buyNow: 'true',
                    providerId: String(pid),
                    foodId: String(item.foodId),
                    quantity: String(item.quantity),
                    price: String(item.price),
                    serviceFee: String(displayServiceFee),
                    stateTax: String(displayStateTax),
                    total: String(total),
                    paymentMethod: 'CARD',
                },
            });
            return;
        }

        router.push({
            pathname: '/screens/card/checkout',
            params: {
                total: String(total),
                serviceFee: String(displayServiceFee),
                stateTax: String(displayStateTax),
                paymentMethod: 'CARD',
                discount: '0',
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
                        price={String(item.price)}
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

                <View className="mt-6">
                    <Text className="font-semibold mb-3">Payment Method</Text>
                    <TouchableOpacity className="p-4 rounded-xl bg-yellow-200">
                        <Text>Card Payment</Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-8">
                    <View className="flex-row justify-between">
                        <Text>Subtotal</Text>
                        <Text>${pricing.subtotal.toFixed(2)}</Text>
                    </View>

                    <View className="flex-row justify-between mt-2">
                        <Text>Service Fee</Text>
                        <Text>${displayServiceFee.toFixed(2)}</Text>
                    </View>

                    <View className="flex-row justify-between mt-2">
                        <Text>{stateTaxInfo?.name || 'City'} Tax</Text>
                        <Text>${displayStateTax.toFixed(2)}</Text>
                    </View>

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
                    disabled={isPricingLoading}
                    className="bg-yellow-400 px-10 py-4 rounded-2xl">
                    {isPricingLoading ? (
                        <ActivityIndicator color="#111" />
                    ) : (
                        <Text className="font-bold text-lg">Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

