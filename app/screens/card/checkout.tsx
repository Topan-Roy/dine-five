import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const router = useRouter();
  const { fetchCart, createOrder, clearCart } = useStore() as any;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState("Cash On Delivery");
  const [cartTotal, setCartTotal] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cartRawData, setCartRawData] = useState<any>(null);

  // Payment methods
  const CARDS = ["Cash On Delivery", "Mastercard - Daniel Jones", "Visa - Daniel Jones"];

  useEffect(() => {
    const loadCartData = async () => {
      const cartData = await fetchCart();
      if (cartData) {
        setCartRawData(cartData);
        setCartSubtotal(cartData.subtotal || 0);
        setCartTotal((cartData.subtotal || 0) + 3.99); // Delivery fee
      }
    };
    loadCartData();
  }, []);

  const handlePlaceOrder = async () => {
    if (!cartRawData || !cartRawData.items || cartRawData.items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setIsLoading(true);
    try {
      // Extract required fields from cartRawData
      // Based on error log: providerId (string), items (array), totalPrice (number) are required

      // We assume each item has a provider. For now taking from first item as orders are usually per provider.
      const firstItem = cartRawData.items[0];
      const providerId = firstItem.foodId.provider || firstItem.foodId.providerId || firstItem.foodId._id; // Fallback if not explicit

      const formattedItems = cartRawData.items.map((item: any) => ({
        foodId: item.foodId._id || item.foodId,
        quantity: item.quantity,
        price: item.price
      }));

      const orderData = {
        providerId: providerId,
        items: formattedItems,
        totalPrice: cartTotal,
        paymentMethod: selectedCard,
        logisticsType: "Delivery"
      };

      console.log("Submitting Order Data:", JSON.stringify(orderData, null, 2));

      const result = await createOrder(orderData);

      if (result && result.success) {
        // Clear the cart after successful order
        await clearCart();
        router.push("/screens/card/order-success");
      } else {
        Alert.alert("Error", result?.message || "Failed to place order");
      }
    } catch (error: any) {
      console.log("Order placement error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Pickup Address */}
        <View className="mb-6">
          <View className="flex-row items-start">
            <Ionicons
              name="location-outline"
              size={24}
              color="#666"
              style={{ marginTop: 2, marginRight: 12 }}
            />
            <View className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">Delivery Address</Text>
              <Text className="text-gray-900 font-bold text-base">
                123 Main St, Apt 4B, New York, NY
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="mb-8"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-start">
              <Ionicons
                name="card-outline"
                size={24}
                color="#666"
                style={{ marginTop: 2, marginRight: 12 }}
              />
              <View>
                <Text className="text-gray-500 text-sm mb-1">Payment Method</Text>
                <Text className="text-gray-900 font-bold text-base">
                  {selectedCard}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>

        {/* Summary */}
        <View className="mt-4 pt-6 border-t border-gray-100">
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-500 text-base">Subtotal</Text>
            <Text className="text-gray-900 font-bold text-base">${cartSubtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-500 text-base">Delivery Fee</Text>
            <Text className="text-gray-900 font-bold text-base">$3.99</Text>
          </View>
          <View className="flex-row justify-between text-lg pt-4 border-t border-gray-100">
            <Text className="text-gray-900 text-lg font-bold">Total</Text>
            <Text className="text-gray-900 text-xl font-bold">${cartTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-16 left-0 right-0 bg-[#FDFBF7] px-4 py-6 border-t border-gray-100 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isLoading}
          className={`bg-yellow-400 px-10 py-4 rounded-2xl shadow-md ${isLoading ? 'opacity-70' : ''}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-gray-900 font-bold text-lg">Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 min-h-[40%]">
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-lg font-bold text-gray-900">
                Choose Payment Method
              </Text>
            </View>

            {CARDS.map((card, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCard(card)}
                className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-3"
              >
                <Text className="text-gray-900 font-medium">{card}</Text>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedCard === card ? "border-[#FFC107]" : "border-gray-300"}`}
                >
                  {selectedCard === card && (
                    <View className="w-2.5 h-2.5 rounded-full bg-[#FFC107]" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-yellow-400 w-full py-4 rounded-2xl shadow-md mt-6 items-center"
            >
              <Text className="text-gray-900 font-bold text-lg">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
