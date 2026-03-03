import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useStore } from '@/stores/stores';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CardScreen() {
  const router = useRouter();
  const { fetchCart, updateCartQuantity, removeCartItem, foodPriceMap } = useStore() as any;
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  const loadCart = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const cartData = await fetchCart();

    if (cartData && cartData.items) {
      const formattedItems = cartData.items.map((item: any) => {
        const foodId = item.foodId?._id || item.foodId?.id || item.foodId;
        const displayPrice = foodPriceMap[foodId] || item.foodId?.baseRevenue || item.price || 0;
        return {
          id: foodId,
          foodId,
          name: item.foodId?.title || item.foodId?.name,
          price: displayPrice,
          image: item.foodId?.image,
          quantity: item.quantity,
        };
      });

      setCartItems(formattedItems);
      setSubtotal(Number(cartData.subtotal || 0));
    } else {
      setCartItems([]);
      setSubtotal(0);
    }

    if (showLoading) setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
    }, [])
  );

  const handleUpdateQuantity = async (
    foodId: string,
    delta: number,
    currentQuantity: number
  ) => {
    const newQuantity = currentQuantity + delta;

    // Optimistic update by foodId so only one product updates.
    setCartItems(prevItems =>
      prevItems
        .map(item =>
          item.foodId === foodId ? { ...item, quantity: newQuantity } : item
        )
        .filter(item => item.quantity > 0)
    );

    try {
      if (newQuantity <= 0) {
        await removeCartItem(foodId);
      } else {
        await updateCartQuantity(foodId, newQuantity);
      }
      await loadCart(false);
    } catch (error) {
      console.log('Error updating quantity:', error);
      await loadCart(false);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#FDFBF7] justify-center items-center">
        <StatusBar style="dark" />
        <Text>Loading Cart...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#FDFBF7]">
        <StatusBar style="dark" />
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

      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cart-outline" size={24} color="#000" />
          <Text className="text-xl font-bold text-gray-900">Cart</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {cartItems.map(item => (
          <CartItem
            key={item.foodId}
            id={item.id}
            name={item.name}
            price={item.price}
            image={item.image}
            quantity={item.quantity}
            onIncrement={() =>
              handleUpdateQuantity(item.foodId, 1, item.quantity)
            }
            onDecrement={() =>
              handleUpdateQuantity(item.foodId, -1, item.quantity)
            }
            onRemove={() =>
              handleUpdateQuantity(
                item.foodId,
                -item.quantity,
                item.quantity
              )
            }
          />
        ))}
      </ScrollView>

      <View className="absolute bottom-24 left-4 right-4 bg-transparent flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/card/confirm-order')}
          className="bg-yellow-400 px-8 py-4 mb-6 rounded-2xl shadow-md">
          <Text className="text-gray-900 font-bold text-lg">Check Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
