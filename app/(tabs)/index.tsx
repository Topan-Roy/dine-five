import { Categories } from '@/components/home/Categories';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PopularHotels } from '@/components/home/PopularHotels';
import { PopularItems } from '@/components/home/PopularItems';
import { SearchBar } from '@/components/home/SearchBar';
import { ViewCart } from '@/components/home/ViewCart';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  const [searchText, setSearchText] = React.useState('');

  const handleAddItem = (price: string) => {
    setCount((prev) => prev + 1);
    setTotal((prev) => prev + parseFloat(price));
  };

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <HomeHeader />
          <SearchBar searchText={searchText} onSearch={setSearchText} />
          <Categories />
          <PopularItems onAddItem={handleAddItem} searchText={searchText} />
          <PopularHotels searchText={searchText} />
        </ScrollView>
        <ViewCart count={count} total={total} />
      </View>
    </View>
  );
}
