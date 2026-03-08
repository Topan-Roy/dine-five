import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type HotelCard = {
  id: number;
  name: string;
  rating: string;
  time: string;
  categories: string;
  image: string;
  providerId?: string;
};

const HOTELS: HotelCard[] = [
  {
    id: 1,
    name: "Silver Inn",
    rating: "4.2",
    time: "32 min",
    categories: "Thai food • Thai food • Thai food",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800",
  },
  {
    id: 2,
    name: "Golden Spoon",
    rating: "4.5",
    time: "25 min",
    categories: "Indian • Curry • Burger",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  },
  {
    id: 3,
    name: "Donut Paradise",
    rating: "4.8",
    time: "15 min",
    categories: "Dessert • Donut • Sweet",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800",
  },
];

export const PopularHotels = ({
  searchText = "",
  activeCategory = "All",
  refreshKey = 0,
}: {
  searchText?: string;
  activeCategory?: string;
  refreshKey?: number;
}) => {
  const router = useRouter();
  const [hotels, setHotels] = React.useState<HotelCard[]>(HOTELS);

  React.useEffect(() => {
    let active = true;

    const loadHotels = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/provider/nearby`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: 23.780704,
              longitude: 90.407756,
              radius: 10,
              page: 1,
              limit: 10,
              sortBy: "distance",
            }),
          },
        );

        if (!res.ok) return;

        const result = await res.json();
        const providers = Array.isArray(result?.data) ? result.data : [];
        if (!providers.length) return;

        const mapped: HotelCard[] = providers.slice(0, 3).map((p: any, idx: number) => {
          const distanceKm = Number(p?.distance ?? 2);
          const etaMin = Math.max(12, Math.round(distanceKm * 12 + 10));
          const cuisines = Array.isArray(p?.cuisine) && p.cuisine.length > 0
            ? p.cuisine.join(" • ")
            : "Restaurant • Fresh food";

          return {
            id: idx + 1,
            providerId: p?.providerId,
            name: p?.restaurantName || HOTELS[idx]?.name || `Hotel ${idx + 1}`,
            rating: String((4.2 + idx * 0.2).toFixed(1)),
            time: `${etaMin} min`,
            categories: cuisines,
            image: p?.profile || HOTELS[idx]?.image,
          };
        });

        if (active && mapped.length > 0) {
          setHotels(mapped);
        }
      } catch {
        // Keep fallback design data when API fails
      }
    };

    loadHotels();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      hotel.categories.toLowerCase().includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  if (searchText && filteredHotels.length === 0) return null;

  return (
    <View className="px-4 mt-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[16px] font-medium text-[#20242A] leading-6 tracking-[0.08px]">
          Popular Restaurant
        </Text>
        <TouchableOpacity>
          <Text className="text-[#EAB308] font-semibold text-base">See all</Text>
        </TouchableOpacity>
      </View>

      {filteredHotels.slice(0, 3).map((hotel) => (
        <TouchableOpacity
          key={hotel.providerId || hotel.id}
          activeOpacity={0.9}
          onPress={() => {
            router.push({
              pathname: "/screens/home/hotel-details",
              params: {
                id: hotel.id,
                providerId: hotel.providerId || "",
                name: hotel.name,
                image: hotel.image,
                rating: hotel.rating,
                categories: hotel.categories,
                time: hotel.time,
                delivery: "Free",
              },
            });
          }}
          className="bg-white rounded-2xl p-3 border border-[#E7E7E7] mb-4"
        >
          <Image
            source={{
              uri: (hotel.image || "").replace("http://", "https://") ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
            }}
            style={{ width: '100%', height: 176, borderRadius: 12, marginBottom: 12 }}
            contentFit="cover"
            transition={500}
          />

          <Text className="text-[16px] font-medium text-[#20242A] leading-6 tracking-[0.08px] mb-2">
            {hotel.name}
          </Text>

          <Text className="text-[#91969E] text-[17px] mb-3">{hotel.categories}</Text>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-md px-2 py-1">
              <Ionicons name="star" size={13} color="#FBBF24" />
              <Text className="text-[#31353B] text-[15px] font-medium ml-1">
                {hotel.rating}
              </Text>
            </View>

            <Text className="text-[#B0B5BC] text-base">•</Text>

            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-[#31353B] text-[15px] ml-1">{hotel.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
