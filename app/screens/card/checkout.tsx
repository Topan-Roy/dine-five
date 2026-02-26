import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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

function CheckoutContent() {
  const router = useRouter();
  const {
    fetchCart,
    createOrder,
    clearCart,
    foodProviderMap,
    createPaymentIntent,
  } = useStore() as any;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState("Cash On Delivery");
  const [cartTotal, setCartTotal] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cartRawData, setCartRawData] = useState<any>(null);

  const CARDS = [
    "Cash On Delivery",
    "Mastercard - Daniel Jones",
    "Visa - Daniel Jones",
  ];

  useEffect(() => {
    const loadCartData = async () => {
      const cartData = await fetchCart();
      if (cartData) {
        setCartRawData(cartData);
        setCartSubtotal(cartData.subtotal || 0);
        setCartTotal((cartData.subtotal || 0) + 3.99);
      }
    };
    loadCartData();
  }, []);

  const handlePlaceOrder = async () => {
    if (!cartRawData?.items?.length) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      const firstItem = cartRawData.items[0];
      const foodId =
        firstItem.foodId?._id ||
        firstItem.foodId?.id ||
        firstItem.foodId;

      const providerId =
        firstItem.providerID ||
        firstItem.foodId?.providerID ||
        firstItem.providerId ||
        firstItem.foodId?.providerId ||
        firstItem.foodId?.provider?._id ||
        foodProviderMap?.[foodId];

      if (!providerId) {
        Alert.alert("Error", "Provider not found");
        return;
      }

      // ==========================
      // 💳 STRIPE PAYMENT SECTION
      // ==========================
      const shouldUseStripe = selectedCard !== "Cash On Delivery";

      if (shouldUseStripe) {
        const itemsForPaymentIntent = cartRawData.items.map((item: any) => ({
          foodId:
            item.foodId?._id ||
            item.foodId?.id ||
            item.foodId,
          quantity: item.quantity,
        }));

        const paymentIntentResult = await createPaymentIntent({
          providerId,
          items: itemsForPaymentIntent,
        });

        const clientSecret =
          paymentIntentResult?.data?.clientSecret;

        if (!clientSecret) {
          Alert.alert("Payment Error", "Failed to create payment intent");
          return;
        }

        const initResult = await initPaymentSheet({
          merchantDisplayName: "Dine Five",
          paymentIntentClientSecret: clientSecret,
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
      }

      // ==========================
      // 🛒 CREATE ORDER
      // ==========================
      const formattedItems = cartRawData.items.map((item: any) => ({
        foodId:
          item.foodId?._id ||
          item.foodId?.id ||
          item.foodId,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        providerId,
        items: formattedItems,
        totalPrice: cartTotal,
        paymentMethod: selectedCard,
        logisticsType: "Delivery",
      };

      const result = await createOrder(orderData);

      if (result?.success) {
        await clearCart();

        router.push({
          pathname: "/screens/card/order-success",
          params: {
            amount: cartTotal.toFixed(2),
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
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="mb-8"
        >
          <Text className="text-gray-500 mb-1">Payment Method</Text>
          <Text className="text-gray-900 font-bold">
            {selectedCard}
          </Text>
        </TouchableOpacity>

        <View className="border-t pt-4">
          <Text>Subtotal: ${cartSubtotal.toFixed(2)}</Text>
          <Text>Platform Fee: $3.99</Text>
          <Text className="text-xl font-bold mt-2">
            Total: ${cartTotal.toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      <View className="p-6 border-t">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isLoading}
          className="bg-yellow-400 py-4 rounded-xl items-center"
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text className="font-bold text-lg">
              Place Order
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-3xl">
            {CARDS.map((card, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCard(card)}
                className="p-4"
              >
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
    </SafeAreaView>
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