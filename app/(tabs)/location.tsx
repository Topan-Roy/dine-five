import RestaurantMapView from '@/components/map/RestaurantMapView';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="items-center justify-center pt-2 pb-4 px-4 bg-yellow-400">
        <Text className="text-xl font-bold text-gray-900">Nearby Restaurants</Text>
      </View>

      {/* Map Container */}
      <View className="flex-1">
        <RestaurantMapView />
      </View>
    </SafeAreaView>
  );
}
