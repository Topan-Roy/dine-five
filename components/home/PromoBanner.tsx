import { useStore } from "@/stores/stores";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.88;
const ITEM_SPACING = 16;
const SNAP_THRESHOLD = ITEM_WIDTH + ITEM_SPACING;

export const PromoBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
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

  // Auto-sliding logic
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [banners]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

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
      <View style={{ width: ITEM_WIDTH }} className="mr-4">
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
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={SNAP_THRESHOLD}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SNAP_THRESHOLD,
          offset: SNAP_THRESHOLD * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View className="flex-row justify-center mt-3">
        {banners.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full mx-1 ${currentIndex === index ? "w-6 bg-[#FFC107]" : "w-1.5 bg-gray-300"
              }`}
          />
        ))}
      </View>
    </View>
  );
};
