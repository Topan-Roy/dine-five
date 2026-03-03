import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PricingBreakdown = {
  subtotal: number;
  platformFee: number;
  stateTax: number;
  textFee: number;
  total: number;
  city: string;
  state: string;
};

function CheckoutContent() {
  const router = useRouter();
  const {
    fetchCart,
    createOrder,
    clearCart,
    foodProviderMap,
    foodServiceFeeMap,
    createPaymentIntent,
  } = useStore() as any;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const params = useLocalSearchParams<{
    paymentMethod?: string;
    buyNow?: string;
    providerId?: string;
    foodId?: string;
    quantity?: string;
    price?: string;
    serviceFee?: string;
  }>();

  const isBuyNow = params.buyNow === "true";

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(
    params.paymentMethod === "CARD" ? "Visa - Daniel Jones" : "Visa - Daniel Jones"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [cartRawData, setCartRawData] = useState<any>(null);
  const [pricing, setPricing] = useState<PricingBreakdown>({
    subtotal: 0,
    platformFee: 0,
    stateTax: 0,
    textFee: 0,
    total: 0,
    city: "Unknown State",
    state: "Unknown State",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const buyNowData = useMemo(() => {
    if (!isBuyNow || !params.foodId) return null;

    const foodId = String(params.foodId);
    const mappedProviderId = foodProviderMap?.[foodId] || "";

    return {
      providerId: String(params.providerId || mappedProviderId),
      itemsForPaymentIntent: [
        {
          foodId,
          quantity: Math.max(1, Number(params.quantity || 1)),
          serviceFee: Number(params.serviceFee || 0),
        },
      ],
      orderItems: [
        {
          foodId,
          quantity: Math.max(1, Number(params.quantity || 1)),
          price: Number(params.price || 0),
          serviceFee: Number(params.serviceFee || 0),
        },
      ],
    };
  }, [isBuyNow, params.providerId, params.foodId, params.quantity, params.price, params.serviceFee, foodProviderMap]);

  const calculatedServiceFee = useMemo(() => {
    if (isBuyNow && buyNowData) {
      return buyNowData.orderItems.reduce((sum: number, item: any) => sum + (Number(item.serviceFee || 0) * item.quantity), 0);
    }
    if (cartRawData && cartRawData.items) {
      return cartRawData.items.reduce((sum: number, item: any) => {
        const foodId = item.foodId?._id || item.foodId?.id || item.foodId;
        const fee = item.foodId?.serviceFee || item.serviceFee || item.foodId?.platformFee || item.platformFee || foodServiceFeeMap[foodId] || 0;
        return sum + (Number(fee) * item.quantity);
      }, 0);
    }
    return 0;
  }, [isBuyNow, buyNowData, cartRawData]);

  const displayServiceFee = pricing.platformFee || calculatedServiceFee;
  const currentTotal = pricing.total || (pricing.subtotal + displayServiceFee + pricing.stateTax);

  const CARDS = ["Mastercard - Daniel Jones", "Visa - Daniel Jones"];

  const getProviderAndItems = (cartData: any) => {
    if (!cartData?.items?.length)
      return { providerId: "", itemsForPaymentIntent: [] as any[], orderItems: [] as any[] };

    const firstItem = cartData.items[0];
    const foodId = firstItem.foodId?._id || firstItem.foodId?.id || firstItem.foodId;

    const providerId =
      firstItem.providerID ||
      firstItem.foodId?.providerID ||
      firstItem.providerId ||
      firstItem.foodId?.provider?._id ||
      foodProviderMap?.[foodId] ||
      "";

    const itemsForPaymentIntent = cartData.items.map((item: any) => {
      const foodId = item.foodId?._id || item.foodId?.id || item.foodId;
      return {
        foodId: foodId,
        quantity: item.quantity,
        serviceFee: item.foodId?.serviceFee || item.serviceFee || item.foodId?.platformFee || item.platformFee || foodServiceFeeMap[foodId] || 0,
      };
    });

    const orderItems = cartData.items.map((item: any) => {
      const foodId = item.foodId?._id || item.foodId?.id || item.foodId;
      return {
        foodId: foodId,
        quantity: item.quantity,
        price: item.price,
        serviceFee: item.foodId?.serviceFee || item.serviceFee || item.foodId?.platformFee || item.platformFee || foodServiceFeeMap[foodId] || 0,
      };
    });

    return { providerId, itemsForPaymentIntent, orderItems };
  };

  useEffect(() => {
    const loadData = async () => {
      if (isBuyNow && buyNowData) {
        const paymentIntentResult = await createPaymentIntent({
          providerId: buyNowData.providerId,
          items: buyNowData.itemsForPaymentIntent,
        });

        const breakdown = paymentIntentResult?.data?.breakdown;
        const secret = paymentIntentResult?.data?.clientSecret;

        if (breakdown) {
          setPricing({
            subtotal: Number(breakdown.subtotal || 0),
            platformFee: Number(breakdown.platformFee || 0),
            stateTax: Number(breakdown.stateTax || 0),
            textFee: Number(breakdown.textFee || 0),
            total: Number(breakdown.total || 0),
            city: breakdown.city || "Unknown State",
            state: breakdown.state || "Unknown State",
          });
        }

        if (secret) setClientSecret(secret);
        return;
      }

      const cartData = await fetchCart();
      if (!cartData?.items?.length) return;

      setCartRawData(cartData);

      const { providerId, itemsForPaymentIntent } = getProviderAndItems(cartData);
      if (!providerId) {
        setPricing((p) => ({ ...p, subtotal: cartData.subtotal || 0, total: cartData.subtotal || 0 }));
        return;
      }

      const paymentIntentResult = await createPaymentIntent({
        providerId,
        items: itemsForPaymentIntent,
      });

      const breakdown = paymentIntentResult?.data?.breakdown;
      const secret = paymentIntentResult?.data?.clientSecret;

      if (breakdown) {
        setPricing({
          subtotal: Number(breakdown.subtotal || 0),
          platformFee: Number(breakdown.platformFee || 0),
          stateTax: Number(breakdown.stateTax || 0),
          textFee: Number(breakdown.textFee || 0),
          total: Number(breakdown.total || 0),
          city: breakdown.city || "Unknown State",
          state: breakdown.state || "Unknown State",
        });
      }

      if (secret) setClientSecret(secret);
    };

    loadData();
  }, [isBuyNow, buyNowData]);

  const handlePlaceOrder = async () => {
    const source = isBuyNow
      ? buyNowData
      : cartRawData?.items?.length
        ? getProviderAndItems(cartRawData)
        : null;

    if (!source || !source.itemsForPaymentIntent?.length) {
      Alert.alert("Error", "No items to checkout");
      return;
    }

    setIsLoading(true);

    try {
      let activeClientSecret = clientSecret;
      if (!activeClientSecret) {
        const paymentIntentResult = await createPaymentIntent({
          providerId: source.providerId,
          items: source.itemsForPaymentIntent,
        });
        activeClientSecret = paymentIntentResult?.data?.clientSecret || null;

        const breakdown = paymentIntentResult?.data?.breakdown;
        if (breakdown) {
          setPricing({
            subtotal: Number(breakdown.subtotal || 0),
            platformFee: Number(breakdown.platformFee || 0),
            stateTax: Number(breakdown.stateTax || 0),
            textFee: Number(breakdown.textFee || 0),
            total: Number(breakdown.total || 0),
            city: breakdown.city || "Unknown State",
            state: breakdown.state || "Unknown State",
          });
        }
      }

      if (!activeClientSecret) {
        Alert.alert("Payment Error", "Failed to create payment intent");
        return;
      }

      const initResult = await initPaymentSheet({
        merchantDisplayName: "Dine Five",
        paymentIntentClientSecret: activeClientSecret,
      });

      if (initResult.error) {
        Alert.alert("Payment Error", initResult.error.message);
        return;
      }

      const paymentResult = await presentPaymentSheet();
      if (paymentResult.error) {
        Alert.alert("Payment Failed", paymentResult.error.message);
        return;
      }

      const orderData = {
        providerId: source.providerId,
        items: source.orderItems,
        totalPrice: currentTotal,
        paymentMethod: selectedCard,
        logisticsType: "Delivery",
      };

      const result = await createOrder(orderData);

      if (result?.success) {
        if (!isBuyNow) {
          await clearCart();
        }

        router.push({
          pathname: "/screens/card/order-success",
          params: {
            amount: currentTotal.toFixed(2),
            paymentMethod: selectedCard,
          },
        });
      } else {
        Alert.alert("Error", result?.message || "Failed to place order");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 w-10 h-10 bg-white rounded-full items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <TouchableOpacity onPress={() => setModalVisible(true)} className="mb-8">
          <Text className="text-gray-500 mb-1">Payment Method</Text>
          <Text className="text-gray-900 font-bold">{selectedCard}</Text>
        </TouchableOpacity>

        <View className="border-t pt-4 space-y-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-900">${pricing.subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Service Fee</Text>
            <Text className="text-gray-900">${displayServiceFee.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">City Tax</Text>
            <Text className="text-gray-900">${pricing.stateTax.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mt-4 pt-4 border-t">
            <Text className="text-xl font-bold">Total</Text>
            <Text className="text-xl font-bold">${currentTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-6 border-t bg-[#FDFBF7]">
        <View className="flex-row justify-between mb-4">
          <Text className="text-2xl font-bold">${currentTotal.toFixed(2)}</Text>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isLoading}
            className="bg-yellow-400 px-10 py-4 rounded-2xl shadow-md"
          >
            {isLoading ? <ActivityIndicator color="#111" /> : <Text className="font-bold text-lg text-[#111]">Confirm & Pay</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-3xl">
            {CARDS.map((card, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedCard(card)} className="p-4">
                <Text>{card}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-yellow-400 py-4 rounded-xl mt-4 items-center"
            >
              <Text className="font-bold">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}

export default function CheckoutScreen() {
  const { fetchStripeConfig } = useStore() as any;
  const [publishableKey, setPublishableKey] = useState("");

  useEffect(() => {
    const loadKey = async () => {
      const result = await fetchStripeConfig();
      const key = result?.data?.publishableKey;
      if (key) setPublishableKey(key);
    };
    loadKey();
  }, []);

  if (!publishableKey) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <CheckoutContent />
    </StripeProvider>
  );
}

