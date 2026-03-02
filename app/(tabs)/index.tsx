import { Categories } from "@/components/home/Categories";
import { HomeHeader } from "@/components/home/HomeHeader";
import { PopularHotels } from "@/components/home/PopularHotels";
import { PopularItems } from "@/components/home/PopularItems";
import { PromoBanner } from "@/components/home/PromoBanner";
import { SearchBar } from "@/components/home/SearchBar";
import { ViewCart } from "@/components/home/ViewCart";
import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cartCount, cartSubtotal, fetchCart, addToCart, cartItems } = useStore() as any;

  const [searchText, setSearchText] = React.useState("");
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const params = useLocalSearchParams();

  React.useEffect(() => {
    if (params.category) {
      setActiveCategory(params.category as string);
    }
  }, [params.category]);

  const handleAddItem = async (item: any) => {
    const targetFoodId = item?.id || item?.foodId || item?._id;

    const alreadyInCart = (cartItems || []).some((cartItem: any) => {
      const cartFoodId = cartItem?.foodId?._id || cartItem?.foodId?.id || cartItem?.foodId || cartItem?._id;
      return String(cartFoodId) === String(targetFoodId);
    });

    if (alreadyInCart) {
      router.push("/(tabs)/card");
      return;
    }

    const result = await addToCart(item, 1);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCart();
      // Incrementing refreshKey will force child components to remount and re-fetch their data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
      // Removed interval fetching because it was causing rate limit errors ("Too many cart requests").
      return () => { };
    }, [fetchCart])
  );

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#EAB308"]} // Yellow color to match theme
              tintColor="#EAB308"
            />
          }
        >
          <HomeHeader />
          <SearchBar
            searchText={searchText}
            onSearch={setSearchText}
            onFilterPress={() => setFilterModalVisible(true)}
          />
          <PromoBanner refreshKey={refreshKey} />
          <Categories
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <PopularItems
            onAddItem={handleAddItem}
            searchText={searchText}
            activeCategory={activeCategory}
            refreshKey={refreshKey}
          />

          <PopularHotels
            searchText={searchText}
            activeCategory={activeCategory}
            refreshKey={refreshKey}
          />

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
                <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
                  Filter Options
                </Text>

                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  className="p-3 rounded-xl mb-2 flex-row justify-between items-center bg-yellow-50 border border-yellow-200"
                >
                  <Text className="font-semibold text-yellow-700">
                    Food Items
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#EAB308"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  className="mt-4 bg-gray-900 p-3 rounded-xl"
                >
                  <Text className="text-white text-center font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
        <ViewCart count={cartCount} total={cartSubtotal} />
      </View>
    </View>
  );
}
