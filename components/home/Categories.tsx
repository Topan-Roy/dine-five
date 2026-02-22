import { useStore } from "@/stores/stores";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

export const Categories = ({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}) => {
  const router = useRouter();
  const { fetchCategories } = useStore() as any;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        // Add "All" category at the beginning
        setCategories([{ _id: "all", categoryName: "All" }, ...data]);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([{ _id: "all", categoryName: "All" }]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={() => router.push("/screens/home/all-categories")}
        >
          <Text className="text-base font-medium text-[#1F2A33]">
            Top Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/screens/home/all-categories")}
        >
          <Text className="text-yellow-500 font-medium text-sm">See all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="h-12 justify-center items-center">
          <ActivityIndicator color="#FFC107" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
        >
          {categories.map((cat, index) => {
            const isActive = activeCategory === cat.categoryName;
            return (
              <TouchableOpacity
                key={cat._id || index}
                onPress={() => onCategoryChange(cat.categoryName)}
                className={`mr-3 px-6 py-2.5 rounded-full border ${isActive ? "bg-yellow-400 border-yellow-400" : "bg-white border-gray-200"}`}
              >
                <Text
                  className={`text-sm ${isActive ? "text-[#1F2A33] font-bold" : "text-[#70756B]"}`}
                >
                  {cat.categoryName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
