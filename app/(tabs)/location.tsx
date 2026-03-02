import { useRestaurantStore } from '@/stores/useRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const FOOD_CARD_WIDTH = width - 56;

const RADIUS_STEPS = [10, 50, 1000, 2000, 5000, 10000];
const CUISINES = ['All', 'Bangladeshi', 'Pizza', 'Fast Food', 'Chinese', 'Italian', 'Indian'];

type PreviewFood = {
  id: string;
  name: string;
  price: number;
  image: string;
  isNew: boolean;
  productDescription: string;
  providerId: string;
  rating: number;
  reviews: number;
};

const FALLBACK_FOOD: PreviewFood = {
  id: 'fallback-food',
  name: 'Cheese Burst Pizza',
  price: 5.99,
  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900',
  isNew: false,
  productDescription: '',
  providerId: '',
  rating: 0,
  reviews: 0,
};

const mapFeedToPreviewFood = (item: any, fallbackProviderId = ''): PreviewFood => {
  const price = Number(item?.finalPriceTag ?? item?.price ?? 0);
  return {
    id: String(item?.id || item?._id || Math.random().toString(36).slice(2)),
    name: item?.name || item?.title || FALLBACK_FOOD.name,
    price: Number.isFinite(price) ? price : FALLBACK_FOOD.price,
    image: item?.image || item?.foodImage || FALLBACK_FOOD.image,
    isNew: Boolean(item?.inStock),
    productDescription: item?.productDescription || item?.description || '',
    providerId: item?.providerID || item?.providerId || fallbackProviderId,
    rating: Number(item?.rating || 0),
    reviews: Number(item?.totalReviews || 0),
  };
};

const formatRadius = (m: number) => (m < 1000 ? `${m}m` : `${m / 1000}km`);
const formatDistance = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export default function LocationScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const {
    location,
    locationLoading,
    restaurants,
    restaurantsLoading,
    restaurantsError,
    selectedRestaurant,
    radiusMeters,
    cuisineFilter,
    fetchLocation,
    fetchNearbyRestaurants,
    startWatchingLocation,
    stopWatchingLocation,
    setSelectedRestaurant,
    setRadiusMeters,
    setCuisineFilter,
  } = useRestaurantStore();

  const [previewFoods, setPreviewFoods] = useState<PreviewFood[]>([FALLBACK_FOOD]);
  const [activeFoodIndex, setActiveFoodIndex] = useState(0);
  const [foodLoading, setFoodLoading] = useState(false);

  const safeRestaurants = useMemo(
    () => restaurants.filter((item) => Number.isFinite(Number(item?.location?.lat)) && Number.isFinite(Number(item?.location?.lng))),
    [restaurants],
  );

  const mapCenter = {
    latitude: location?.latitude ?? 23.780704,
    longitude: location?.longitude ?? 90.407756,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const openRestaurantDetails = () => {
    if (!selectedRestaurant) return;

    const etaMin = Math.max(12, Math.round(selectedRestaurant.distance * 12 + 10));
    const categories =
      Array.isArray(selectedRestaurant.cuisine) && selectedRestaurant.cuisine.length > 0
        ? selectedRestaurant.cuisine.join(' • ')
        : 'Restaurant • Fresh food';

    router.push({
      pathname: '/screens/home/hotel-details',
      params: {
        id: selectedRestaurant.providerId || '1',
        providerId: selectedRestaurant.providerId,
        name: selectedRestaurant.restaurantName,
        image: selectedRestaurant.profile || FALLBACK_FOOD.image,
        rating: '4.95',
        categories,
        time: `${etaMin} min`,
        delivery: 'Free',
      },
    });
  };

  useEffect(() => {
    fetchLocation();
    startWatchingLocation();
    return () => stopWatchingLocation();
  }, []);

  useEffect(() => {
    if (location && !selectedRestaurant) {
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        800,
      );
    }
  }, [location?.latitude, location?.longitude, selectedRestaurant]);

  useEffect(() => {
    if (!location) return;

    fetchNearbyRestaurants({
      latitude: location.latitude,
      longitude: location.longitude,
      radius: radiusMeters,
      cuisine: cuisineFilter === 'All' ? undefined : cuisineFilter,
      sortBy: 'distance',
    });
  }, [location?.latitude, location?.longitude, radiusMeters, cuisineFilter]);

  useEffect(() => {
    let active = true;

    const loadPreviewFoods = async () => {
      if (!selectedRestaurant?.providerId) {
        setPreviewFoods([FALLBACK_FOOD]);
        setActiveFoodIndex(0);
        setFoodLoading(false);
        return;
      }

      setFoodLoading(true);

      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/feed?providerId=${selectedRestaurant.providerId}&page=1&limit=10`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (!res.ok) {
          throw new Error('Failed to load provider foods');
        }

        const result = await res.json();
        const list = Array.isArray(result?.data) ? result.data : [];

        if (!active) return;

        if (!list.length) {
          setPreviewFoods([FALLBACK_FOOD]);
          setActiveFoodIndex(0);
          return;
        }

        setPreviewFoods(list.map((item: any) => mapFeedToPreviewFood(item, selectedRestaurant.providerId)));
        setActiveFoodIndex(0);
      } catch {
        if (active) {
          setPreviewFoods([FALLBACK_FOOD]);
          setActiveFoodIndex(0);
        }
      } finally {
        if (active) {
          setFoodLoading(false);
        }
      }
    };

    if (selectedRestaurant) {
      loadPreviewFoods();
    } else {
      setPreviewFoods([FALLBACK_FOOD]);
      setActiveFoodIndex(0);
      setFoodLoading(false);
    }

    return () => {
      active = false;
    };
  }, [selectedRestaurant?.providerId]);

  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FFC107" />
        <Text className="mt-4 font-medium text-gray-500">Locating you...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      <View className="bg-[#FFC107] pt-2 pb-4 px-4 items-center">
        <Text className="text-xl font-bold text-gray-900">Nearby Restaurants</Text>
      </View>

      <View className="bg-white shadow-sm pb-4">
        <View className="flex-row justify-between px-6 py-2">
          {RADIUS_STEPS.map((step) => (
            <TouchableOpacity key={step} onPress={() => setRadiusMeters(step)}>
              <Text className={`text-[10px] font-bold ${radiusMeters === step ? 'text-[#FFC107]' : 'text-gray-400'}`}>
                {formatRadius(step)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 h-8 justify-center">
          <Slider
            minimumValue={10}
            maximumValue={10000}
            value={radiusMeters}
            onSlidingComplete={(val) => setRadiusMeters(Math.round(val))}
            minimumTrackTintColor="#FFC107"
            maximumTrackTintColor="#F3F4F6"
            thumbTintColor="#FFC107"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 px-4">
          {CUISINES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCuisineFilter(cat)}
              className={`mr-2 px-5 py-2 rounded-full border ${
                cuisineFilter === cat || (!cuisineFilter && cat === 'All')
                  ? 'bg-[#FFC107] border-[#FFC107]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  cuisineFilter === cat || (!cuisineFilter && cat === 'All') ? 'text-white' : 'text-gray-500'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1 relative">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={mapCenter}
          showsUserLocation={false}
          showsMyLocationButton={false}
          scrollEnabled={!selectedRestaurant}
          rotateEnabled={!selectedRestaurant}
          pitchEnabled={!selectedRestaurant}
          onPress={() => setSelectedRestaurant(null)}
        >
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              anchor={{ x: 0.5, y: 0.55 }}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-white border-2 border-[#ECECEC] items-center justify-center shadow-md">
                  <Ionicons name="person" size={22} color="#F2B705" />
                </View>
              </View>
            </Marker>
          )}

          {selectedRestaurant && location && (
            <Polyline
              coordinates={[
                { latitude: location.latitude, longitude: location.longitude },
                {
                  latitude: selectedRestaurant.location.lat,
                  longitude: selectedRestaurant.location.lng,
                },
              ]}
              strokeColor="#0F73F7"
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {safeRestaurants.map((item, idx) => {
            const isSelected = selectedRestaurant?.providerId === item.providerId;
            return (
              <Marker
                key={`${item.providerId}-${idx}`}
                coordinate={{ latitude: item.location.lat, longitude: item.location.lng }}
                anchor={{ x: 0.5, y: 0.95 }}
                onPress={() => {
                  setSelectedRestaurant(item);
                  mapRef.current?.animateToRegion(
                    {
                      latitude: item.location.lat,
                      longitude: item.location.lng,
                      latitudeDelta: 0.008,
                      longitudeDelta: 0.008,
                    },
                    450,
                  );
                }}
              >
                <View className="items-center">
                  <View
                    className={`rounded-full ${isSelected ? 'w-14 h-14 bg-[#30343A]' : 'w-12 h-12 bg-white'} border-2 border-white items-center justify-center shadow-xl`}
                  >
                    {isSelected ? (
                      <Image
                        source={{ uri: item.profile || 'https://via.placeholder.com/120' }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                    ) : (
                      <Ionicons name="storefront-outline" size={24} color="#E5482B" />
                    )}
                  </View>
                  <View className="w-3 h-3 bg-white rotate-45 -mt-1 border-r border-b border-[#EBEBEB]" />
                </View>
              </Marker>
            );
          })}
        </MapView>

        <View className={`absolute left-4 bg-white/95 px-4 py-2 rounded-full shadow-xl border border-gray-100 ${selectedRestaurant ? 'bottom-[390px]' : 'bottom-[220px]'}`}>
          <Text className="text-xs font-bold text-gray-800">
            {restaurantsLoading
              ? 'Searching...'
              : restaurantsError
                ? 'Unable to load restaurants'
                : `${safeRestaurants.length} restaurants found`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => fetchLocation()}
          className={`absolute right-4 bg-white w-12 h-12 rounded-2xl items-center justify-center shadow-xl border border-gray-100 ${selectedRestaurant ? 'bottom-[390px]' : 'bottom-[220px]'}`}
        >
          <Ionicons name="locate" size={26} color="#FFC107" />
        </TouchableOpacity>

        {selectedRestaurant && (
          <View className="absolute bottom-[86px] left-3 right-3 rounded-[28px] bg-[#F3F3F3] border border-[#DCDCDC] p-4 shadow-2xl">
            <View className="flex-row items-start">
              <TouchableOpacity activeOpacity={0.9} onPress={openRestaurantDetails}>
                <Image
                  source={{ uri: selectedRestaurant.profile || 'https://via.placeholder.com/160' }}
                  className="w-20 h-20 rounded-full"
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={openRestaurantDetails} className="flex-1 ml-4 pr-8">
                <Text className="text-[16px] leading-6 font-semibold text-[#3D403C]" numberOfLines={1}>
                  {selectedRestaurant.restaurantName}
                </Text>

                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={16} color="#676A67" />
                  <Text className="text-[15px] text-[#555] ml-1 flex-1" numberOfLines={1}>
                    {selectedRestaurant.restaurantAddress}
                  </Text>
                </View>

                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={16} color="#F4B400" />
                  <Text className="text-[14px] text-[#3D403C] ml-2">
                    4.95 ({Math.max(120, (selectedRestaurant.availableFoods || 3) * 40)} reviews)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectedRestaurant(null)} className="absolute right-0 top-0 p-1">
                <Ionicons name="close-circle" size={24} color="#C3C3C3" />
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              {foodLoading ? (
                <View className="w-full py-8 items-center justify-center bg-white rounded-3xl border border-[#ECE2C9]">
                  <ActivityIndicator size="small" color="#FFC107" />
                </View>
              ) : (
                <>
                  <FlatList
                    data={previewFoods}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    nestedScrollEnabled
                    directionalLockEnabled
                    decelerationRate="fast"
                    snapToInterval={FOOD_CARD_WIDTH}
                    snapToAlignment="start"
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / FOOD_CARD_WIDTH);
                      setActiveFoodIndex(index);
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.95}
                        onPress={() => {
                          router.push({
                            pathname: '/screens/home/product-details',
                            params: {
                              id: item.id,
                              foodId: item.id,
                              name: item.name,
                              price: item.price.toFixed(2),
                              image: item.image,
                              rating: String(item.rating || 0),
                              reviews: String(item.reviews || 0),
                              restaurantName: selectedRestaurant.restaurantName,
                              restaurantProfile: selectedRestaurant.profile || '',
                              productDescription: item.productDescription || '',
                              providerId: item.providerId || selectedRestaurant.providerId,
                            },
                          });
                        }}
                        style={{ width: FOOD_CARD_WIDTH }}
                        className="bg-white rounded-3xl border border-[#ECE2C9] p-3 flex-row items-center mr-2"
                      >
                        <Image source={{ uri: item.image }} className="w-[46%] h-36 rounded-2xl" resizeMode="cover" />

                        <View className="flex-1 ml-4">
                          <Text className="text-[16px] leading-6 text-[#5A5E58] font-medium" numberOfLines={2}>
                            {item.name}
                          </Text>

                          <Text className="text-[16px] leading-6 font-semibold text-[#3D403C] mt-5">
                            ${Number(item.price).toFixed(2)}
                          </Text>
                        </View>

                        <TouchableOpacity className="w-11 h-11 rounded-full bg-[#F7D24D] items-center justify-center ml-3">
                          <Ionicons name="add" size={20} color="#3A3A3A" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                  />

                  {previewFoods.length > 1 && (
                    <View className="flex-row justify-center mt-2">
                      {previewFoods.map((item, idx) => (
                        <View
                          key={item.id}
                          className={`mx-1 rounded-full ${activeFoodIndex === idx ? 'w-4 h-1.5 bg-[#FFC107]' : 'w-1.5 h-1.5 bg-[#CFCFCF]'}`}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            <View className="mt-2 items-end">
              <Text className="text-[12px] text-[#8A8A8A]">{formatDistance(selectedRestaurant.distance)} away</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}




