import { CartItem } from '@/components/card/CartItem';
import { EmptyState } from '@/components/common/EmptyState';
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

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

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
            key={item.id}
            {...item}
            onIncrement={() => updateQuantity(item.id, 1)}
            onDecrement={() => updateQuantity(item.id, -1)}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-24 left-4 right-4 bg-transparent flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => router.push('/screens/card/confirm-order')}
          className="bg-yellow-400 px-8 py-4 rounded-2xl shadow-md">
          <Text className="text-gray-900 font-bold text-lg">Check Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
