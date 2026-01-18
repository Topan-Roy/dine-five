import { Categories } from '@/components/home/Categories';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PopularHotels } from '@/components/home/PopularHotels';
import { PopularItems } from '@/components/home/PopularItems';
import { SearchBar } from '@/components/home/SearchBar';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <HomeHeader />
          <SearchBar />
          <Categories />
          <PopularItems />
          <PopularHotels />
        </ScrollView>
      </View>
    </View>
  );
}
