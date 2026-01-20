import { Categories } from '@/components/home/Categories';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PopularHotels } from '@/components/home/PopularHotels';
import { PopularItems } from '@/components/home/PopularItems';
import { PromoBanner } from '@/components/home/PromoBanner';
import { SearchBar } from '@/components/home/SearchBar';
import { ViewCart } from '@/components/home/ViewCart';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  const [searchText, setSearchText] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'food' | 'hotel'>('all');
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);

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
          <SearchBar
            searchText={searchText}
            onSearch={setSearchText}
            onFilterPress={() => setFilterModalVisible(true)}
          />
          <PromoBanner />
          <Categories />


          {(filterType === 'all' || filterType === 'food') && (
            <PopularItems onAddItem={handleAddItem} searchText={searchText} />
          )}

          {(filterType === 'all' || filterType === 'hotel') && (
            <PopularHotels searchText={searchText} />
          )}

          <Modal
            animationType="fade"
            transparent={true}
            visible={filterModalVisible}
            onRequestClose={() => setFilterModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setFilterModalVisible(false)}
              className="flex-1 bg-black/40 items-center justify-center"
            >
              <View className="bg-white m-4 p-4 rounded-2xl w-3/4 shadow-xl">
                <Text className="text-lg font-bold text-gray-900 mb-4 text-center">Filter By</Text>

                <TouchableOpacity
                  onPress={() => {
                    setFilterType('food');
                    setFilterModalVisible(false);
                  }}
                  className={`p-3 rounded-xl mb-2 flex-row justify-between items-center ${filterType === 'food' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                >
                  <Text className={`font-semibold ${filterType === 'food' ? 'text-yellow-700' : 'text-gray-700'}`}>Food</Text>
                  {filterType === 'food' && <Ionicons name="checkmark-circle" size={20} color="#EAB308" />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFilterType('hotel');
                    setFilterModalVisible(false);
                  }}
                  className={`p-3 rounded-xl mb-2 flex-row justify-between items-center ${filterType === 'hotel' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                >
                  <Text className={`font-semibold ${filterType === 'hotel' ? 'text-yellow-700' : 'text-gray-700'}`}>Hotel</Text>
                  {filterType === 'hotel' && <Ionicons name="checkmark-circle" size={20} color="#EAB308" />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFilterType('all');
                    setFilterModalVisible(false);
                  }}
                  className={`p-3 rounded-xl flex-row justify-between items-center ${filterType === 'all' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                >
                  <Text className={`font-semibold ${filterType === 'all' ? 'text-yellow-700' : 'text-gray-700'}`}>Show All</Text>
                  {filterType === 'all' && <Ionicons name="checkmark-circle" size={20} color="#EAB308" />}
                </TouchableOpacity>

              </View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
        <ViewCart count={count} total={total} />
      </View>
    </View>
  );
}
