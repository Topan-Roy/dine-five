import { Image } from "expo-image";
import React from "react";
import { Dimensions, FlatList, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const PROMOS = [
  {
    id: "1",
    title: "35% OFF on Burgers!",
    subtitle: "Order your favorites now",
    buttonText: "Buy now",
    backgroundColor: "#FFE69C",
    bgImage: require("@/assets/images/promo-bg.svg"),
    frontImage: require("@/assets/images/promo-fron.svg"),
    buttonColor: "#FFC107",
  },
  {
    id: "2",
    title: "20% OFF on Pizza!",
    subtitle: "Delicious pepperoni",
    buttonText: "Order Now",
    backgroundColor: "#DCFCE7",
    bgImage: require("@/assets/images/promo-bg.svg"),
    frontImage: require("@/assets/images/promo-fron.svg"),
    buttonColor: "#22C55E",
  },
  {
    id: "3",
    title: "Free Drinks!",
    subtitle: "With every combo",
    buttonText: "Get Deal",
    backgroundColor: "#DBEAFE",
    bgImage: require("@/assets/images/promo-bg.svg"),
    frontImage: require("@/assets/images/promo-fron.svg"),
    buttonColor: "#3B82F6",
  },
];

export const PromoBanner = () => {
  const renderItem = ({ item }: { item: typeof PROMOS[0] }) => (
    <View style={{ width: width * 0.85 }} className="mr-4">
      <View
        style={{ backgroundColor: item.backgroundColor }}
        className="rounded-3xl p-5 flex-row items-center justify-between overflow-hidden relative min-h-[160px]"
      >
        <View className="z-10 flex-1 pr-4">
          <Text className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            {item.title}
          </Text>
          <Text className="text-sm text-gray-600 mb-4 font-medium">
            {item.subtitle}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ backgroundColor: item.buttonColor }}
            className="px-6 py-3 rounded-xl self-start shadow-sm"
          >
            <Text className="text-gray-900 font-bold text-sm">{item.buttonText}</Text>
          </TouchableOpacity>
        </View>

        <View className="absolute -right-2 top-0 bottom-0 justify-center w-[45%]">
          <View className="w-[150px] h-[140px] justify-center items-center">
            <Image
              source={item.bgImage}
              className="absolute inset-0 w-full h-full"
              contentFit="contain"
            />
            <Image
              source={item.frontImage}
              contentFit="contain"
              style={{ height: 126, width: 100 }}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="mt-6">
      <FlatList
        data={PROMOS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={width * 0.85 + 16}
        decelerationRate="fast"
      />
    </View>
  );
};
