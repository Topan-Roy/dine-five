import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const CATEGORIES = ["All", "Burger", "Pizza", "Donut", "Drinks", "Tacos"];

export const Categories = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-base font-medium text-[#1F2A33]">
          Top Categories
        </Text>
        <TouchableOpacity>
          <Text className="text-yellow-500 font-medium text-sm">See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
      >
        {CATEGORIES.map((cat, index) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveCategory(cat)}
              className={`mr-3 px-6 py-2.5 rounded-full border ${isActive ? "bg-yellow-400 border-yellow-400" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`${isActive ? "text-[#1F2A33] font-medium text-base" : "text-[#70756B]"}`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
