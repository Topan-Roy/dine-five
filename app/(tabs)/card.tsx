import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useStore } from '@/stores/stores';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy data
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
  }
];

export default function CardScreen() {
  const router = useRouter();
  const { fetchCart, updateCartQuantity, removeCartItem } = useStore() as any;
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  const loadCart = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const cartData = await fetchCart();
    if (cartData && cartData.items) {
      // Map API items to component structure if needed, or use directly
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
    if (showLoading) setLoading(false);
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
        // Remove item
        await removeCartItem(foodId); // Using foodId for API
      } else {
        // Update quantity
        await updateCartQuantity(foodId, newQuantity); // Using foodId for API
      }
      // Refresh cart silently to get updated calculations from server
      await loadCart(false);
    } catch (error) {
      console.log("Error updating quantity:", error);
      // Revert or force reload on error
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

      {/* Header */}
      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cart-outline" size={24} color="#000" />
          <Text className="text-xl font-bold text-gray-900">Cart</Text>
        </View>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
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
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-24 left-4 right-4 bg-transparent flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/card/confirm-order')}
          className="bg-yellow-400 px-8 py-4 rounded-2xl shadow-md">
          <Text className="text-gray-900 font-bold text-lg">Check Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
