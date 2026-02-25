import { useRestaurantStore } from '@/stores/useRestaurantStore';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const RADIUS_STEPS = [10, 50, 1000, 2000, 5000, 10000];
const CUISINES = ["All", "Bangladeshi", "Pizza", "Fast Food", "Chinese", "Italian", "Indian"];

export default function LocationScreen() {
  const mapRef = useRef<MapView>(null);
  const {
    location,
    locationLoading,
    restaurants,
    restaurantsLoading,
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

  const [localRadius, setLocalRadius] = useState(radiusMeters);

  // 1. Initial Load
  useEffect(() => {
    fetchLocation();
    startWatchingLocation();
    return () => stopWatchingLocation();
  }, []);

  // 2. Center map on user movement
  useEffect(() => {
    if (location && !selectedRestaurant) {
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [location?.latitude, location?.longitude]);

  // 3. Fetch when filters change
  useEffect(() => {
    if (location) {
      fetchNearbyRestaurants({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: radiusMeters,
        cuisine: cuisineFilter === 'All' ? undefined : cuisineFilter,
        sortBy: 'distance',
      });
    }
  }, [location?.latitude, location?.longitude, radiusMeters, cuisineFilter]);

  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FFC107" />
        <Text className="mt-4 font-medium text-gray-500">Locating you...</Text>
      </View>
    );
  }

  const formatRadius = (m: number) => (m < 1000 ? `${m}m` : `${m / 1000}km`);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View className="bg-[#FFC107] pt-2 pb-4 px-4 items-center">
        <Text className="text-xl font-bold text-gray-900">Nearby Restaurants</Text>
      </View>

      {/* ── Filter Section (Slider + Cuisine) ── */}
      <View className="bg-white shadow-sm pb-4">
        {/* Radius Steps */}
        <View className="flex-row justify-between px-6 py-2">
          {RADIUS_STEPS.map((step) => (
            <TouchableOpacity key={step} onPress={() => setRadiusMeters(step)}>
              <Text className={`text-[10px] font-bold ${radiusMeters === step ? 'text-[#FFC107]' : 'text-gray-400'}`}>
                {formatRadius(step)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slider */}
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

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 px-4">
          {CUISINES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCuisineFilter(cat)}
              className={`mr-2 px-5 py-2 rounded-full border ${cuisineFilter === cat || (!cuisineFilter && cat === 'All') ? 'bg-[#FFC107] border-[#FFC107]' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-bold ${cuisineFilter === cat || (!cuisineFilter && cat === 'All') ? 'text-white' : 'text-gray-500'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Map Content ── */}
      <View className="flex-1 relative">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onPress={() => setSelectedRestaurant(null)}
        >
          {/* 📍 Route Line - Only shows when a restaurant is clicked */}
          {selectedRestaurant && location && (
            <Polyline
              coordinates={[
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                {
                  latitude: selectedRestaurant.location.lat,
                  longitude: selectedRestaurant.location.lng,
                },
              ]}
              strokeColor="#0F73F7"
              strokeWidth={5}
              lineDashPattern={[0]}
            />
          )}

          {restaurants.map((item, idx) => (
            <Marker
              key={`${item.providerId}-${idx}`}
              coordinate={{ latitude: item.location.lat, longitude: item.location.lng }}
              onPress={() => setSelectedRestaurant(item)}
            >
              <View className="items-center">
                <View className={`rounded-full border-2 shadow-xl ${selectedRestaurant?.providerId === item.providerId ? 'border-[#FFC107] p-0.5 bg-white' : 'p-2 bg-white border-[#FFC107]'}`}>
                  {selectedRestaurant?.providerId === item.providerId ? (
                    <Image
                      source={{ uri: item.profile || 'https://via.placeholder.com/150' }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  ) : (
                    <Ionicons name="restaurant" size={20} color="#FFC107" />
                  )}
                </View>
                {/* 📍 Click korle durutto dekhabe - Premium Yellow Badge */}
                {selectedRestaurant?.providerId === item.providerId && (
                  <View className="bg-yellow-400 px-3 py-1 rounded-full mt-2 border-2 border-white shadow-2xl">
                    <Text className="text-[14px] font-black text-gray-900">
                      {item.distance < 1 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)}km`}
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Found Badge - moved up to clear tab bar/card */}
        <View className="absolute bottom-[230px] left-4 bg-white/95 px-4 py-2 rounded-full shadow-xl border border-gray-100">
          <Text className="text-xs font-bold text-gray-800">
            {restaurantsLoading ? "Searching..." : `${restaurants.length} restaurants found`}
          </Text>
        </View>

        {/* Locate Me FAB - moved up to clear tab bar/card */}
        <TouchableOpacity
          onPress={() => fetchLocation()}
          className="absolute bottom-[230px] right-4 bg-white w-12 h-12 rounded-2xl items-center justify-center shadow-xl border border-gray-100"
        >
          <Ionicons name="locate" size={26} color="#FFC107" />
        </TouchableOpacity>

        {/* ── Restaurant Info Card ── moved up to clear tab bar */}
        {selectedRestaurant && (
          <View className="absolute bottom-[110px] left-4 right-4 bg-white rounded-3xl shadow-2xl p-4 flex-row items-center border border-gray-100">
            <Image
              source={{ uri: selectedRestaurant.profile || 'https://via.placeholder.com/150' }}
              className="w-20 h-20 rounded-2xl"
              resizeMode="cover"
            />
            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{selectedRestaurant.restaurantName}</Text>
                  <Text className="text-gray-500 text-xs">Restaurant</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedRestaurant(null)}>
                  <Ionicons name="close-circle" size={24} color="#E5E7EB" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text className="text-[10px] text-gray-500 ml-1" numberOfLines={1}>{selectedRestaurant.restaurantAddress}</Text>
              </View>
              <View className="flex-row gap-3 mt-2">
                <View className="bg-orange-50 px-2 py-1 rounded-lg flex-row items-center">
                  <Ionicons name="navigate" size={12} color="#F59E0B" />
                  <Text className="text-[10px] font-bold text-orange-600 ml-1">
                    {selectedRestaurant.distance < 1 ? `${Math.round(selectedRestaurant.distance * 1000)} m` : `${selectedRestaurant.distance.toFixed(1)} km`}
                  </Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded-lg flex-row items-center">
                  <Ionicons name="restaurant" size={12} color="#3B82F6" />
                  <Text className="text-[10px] font-bold text-blue-600 ml-1">{selectedRestaurant.availableFoods || 0} items</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
