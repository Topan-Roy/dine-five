import { useStore } from "@/stores/stores";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export const PromoBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchBanners } = useStore() as any;

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await fetchBanners();
        if (data && data.length > 0) {
          setBanners(data);
        } else {
          // Fallback static banners if API returns empty
          setBanners([
            {
              _id: "static-1",
              title: "Special Offer: 50% Off",
              bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
            },
            {
              _id: "static-2",
              title: "Free Delivery Today",
              bannerImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
            }
          ]);
        }
      } catch (error) {
        console.error("Error loading banners:", error);
        // Fallback on error
        setBanners([
          {
            _id: "static-err",
            title: "Delicious Food Awaits",
            bannerImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  if (loading) {
    return (
      <View className="mt-6 h-[160px] justify-center items-center">
        <ActivityIndicator color="#FFC107" size="large" />
      </View>
    );
  }

  if (banners.length === 0) return null;

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={{ width: width * 0.88 }} className="mr-4">
        <View
          style={{ backgroundColor: "#FFE69C" }}
          className="rounded-[32px] flex-row items-center justify-between overflow-hidden relative min-h-[160px] p-6"
        >
          {/* Text Content */}
          <View className="z-10 flex-1 pr-2">
            <Text
              numberOfLines={2}
              className="text-[20px] font-bold text-[#332701] mb-1 leading-tight"
            >
              {item.title}
            </Text>
            <Text className="text-sm text-[#332701] opacity-70 mb-4 font-medium">
              {item.title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{ backgroundColor: "#FFC107" }}
              className="px-6 py-2.5 rounded-xl self-start shadow-sm"
            >
              <Text className="text-[#332701] font-bold text-base">Buy now</Text>
            </TouchableOpacity>
          </View>

          {/* Floating Image */}
          <View className="absolute right-[-10] top-0 bottom-0 w-[50%] items-center justify-center">
            {/* Main Product Image with a soft shadow to create depth */}
            <View style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}>
              <Image
                source={{ uri: item.bannerImage }}
                style={{ width: 160, height: 160 }}
                contentFit="contain"
                transition={700}
                cachePolicy="memory-disk"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="mt-6">
      <FlatList
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={width * 0.85 + 16}
        decelerationRate="fast"
      />
    </View>
  );
};
