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
        stateTax?: string;
        restaurantAddress?: string;
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
    const [isInitialLoading, setIsInitialLoading] = useState(true);

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
        fallbackSubtotal: number,
        silent = false
    ) => {
        if (!providerId || !itemsForPaymentIntent.length) {
            setPricing((prev) => ({
                ...prev,
                subtotal: fallbackSubtotal,
                total: fallbackSubtotal,
            }));
            return;
        }

        if (!silent) setIsPricingLoading(true);
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
                localSubtotal,
                false // show loader for initial load
            );
            setIsInitialLoading(false);
            return;
        }

        const cartData = await fetchCart();
        if (cartData && cartData.items) {
            const formattedItems = cartData.items.map((item: any) => {
                const foodId = item.foodId?._id || item.foodId?.id || item.foodId;
                return {
                    id: String(foodId || item._id),
                    cartItemId: String(item._id || foodId),
                    name: item.foodId?.title || item.foodId?.name,
                    image: item.foodId?.image,
                    quantity: Number(item.quantity || 0),
                    foodId: String(foodId),
                    providerId:
                        String(item.providerID ||
                            item.foodId?.providerID ||
                            item.providerId ||
                            item.foodId?.providerId ||
                            item.foodId?.provider?._id ||
                            ''),
                    price: Number(foodPriceMap[foodId] || item.price || item.foodId?.price || 0),
                    serviceFee:
                        Number(item.foodId?.serviceFee ||
                            item.serviceFee ||
                            item.foodId?.platformFee ||
                            item.platformFee ||
                            foodServiceFeeMap[foodId] ||
                            0),
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

            await loadPricing(providerId, itemsForPaymentIntent, localSubtotal, false);
        } else {
            setCartItems([]);
            setSubtotal(0);
        }
        setIsInitialLoading(false);
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
            await loadPricing(providerId, [{ foodId: item.foodId, quantity: item.quantity }], localSubtotal, true);
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
            // Silent sync with server
            const cartData = await fetchCart();
            if (cartData && cartData.items) {
                const updatedItems = cartData.items.map((item: any) => {
                    const fid = item.foodId?._id || item.foodId?.id || item.foodId;
                    return {
                        id: String(fid || item._id),
                        cartItemId: String(item._id || fid),
                        name: item.foodId?.title || item.foodId?.name,
                        image: item.foodId?.image,
                        quantity: Number(item.quantity || 0),
                        foodId: String(fid),
                        providerId: String(item.providerID || item.foodId?.providerID || item.providerId || item.foodId?.providerId || item.foodId?.provider?._id || ''),
                        price: Number(foodPriceMap[fid] || item.price || item.foodId?.price || 0),
                        serviceFee: Number(item.foodId?.serviceFee || item.serviceFee || item.foodId?.platformFee || item.platformFee || foodServiceFeeMap[fid] || 0),
                    };
                });
                setCartItems(updatedItems);
                const localSubtotal = Number(cartData.subtotal || 0);
                setSubtotal(localSubtotal);

                const first = updatedItems[0];
                const providerId = first?.providerId || foodProviderMap?.[first?.foodId] || '';
                const itemsForIntent = updatedItems.map((item: any) => ({
                    foodId: item.foodId,
                    quantity: item.quantity,
                    serviceFee: item.serviceFee || 0,
                    price: item.price
                }));
                await loadPricing(providerId, itemsForIntent, localSubtotal, true); // SILENT sync
            }
        } catch (err) {
            console.log(err);
            await loadCart();
        }
    };

    // Unit-based fees for display only (requested by user to keep fixed on this page)
    const unitServiceFee = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + Number(item.serviceFee || 0), 0);
    }, [cartItems]);

    const unitPriceTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    }, [cartItems]);

    const displayServiceFee = Number(unitServiceFee > 0 ? unitServiceFee : (pricing.platformFee || 0));

    // STRICT FIXED TAX: Calculate tax ONLY for one unit of the items (e.g. 0.90 flat for the whole order)
    // We take the price of the first item to determine the base tax, which will stay fixed.
    const firstItemPrice = isBuyNow ? Number(params.price || 0) : (cartItems[0]?.price || 0);
    const calculatedTaxFromRate = stateTaxInfo?.tax ? (Number(firstItemPrice) * Number(stateTaxInfo.tax) / 100) : Number(params.stateTax || 0);
    const qtyForNormalization = isBuyNow ? Math.max(1, Number(params.quantity || 1)) : (cartItems?.reduce((sum, i) => sum + Number(i.quantity || 0), 0) || 1);

    // This amount (e.g. 0.90) will NOT change even if quantity or products increase
    const displayStateTax = Number(calculatedTaxFromRate > 0 ? calculatedTaxFromRate : (pricing.stateTax > 0 ? (pricing.stateTax / qtyForNormalization) : 0));

    // Use direct sum of displayed components to ensure mathematical consistency in UI
    const total = Number((unitPriceTotal + displayServiceFee + displayStateTax).toFixed(2));

    // Real total for calculation/passing to next screen
    const realTotal = Number((subtotal + cartItems.reduce((sum, item) => sum + (Number(item.serviceFee || 0) * item.quantity), 0) + displayStateTax).toFixed(2));

    useEffect(() => {
        console.log("Tax Debug Info:", {
            userState,
            taxRate: stateTaxInfo?.tax,
            unitSubtotal: unitPriceTotal,
            subtotal,
            calculatedTax: displayStateTax
        });
    }, [userState, stateTaxInfo, subtotal, displayStateTax, pricing.stateTax]);

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
                    serviceFee: String(item.serviceFee || 0),
                    stateTax: String(displayStateTax),
                    total: String(total),
                    paymentMethod: 'CARD',
                    restaurantAddress: params.restaurantAddress,
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
                restaurantAddress: params.restaurantAddress,
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

