import { useRestaurantStore } from '@/stores/useRestaurantStore';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationScreen() {
  const mapRef = useRef<MapView>(null);

  const {
    location,
    locationLoading,
    restaurants,
    restaurantsLoading,
    selectedRestaurant,
    fetchLocation,
    fetchNearbyRestaurants,
    setSelectedRestaurant,
  } = useRestaurantStore();

  // Fetch location + nearby restaurants on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyRestaurants();
    }
  }, [location]);

  // Auto fit map to user + restaurants
  useEffect(() => {
    if (mapRef.current && location) {
      const coordinates: any[] = [
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      ];

      restaurants?.forEach((item: any) => {
        coordinates.push({
          latitude: item.location.lat,
          longitude: item.location.lng,
        });
      });

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }
    }
  }, [restaurants, location]);

  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Getting your location...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="items-center justify-center pt-2 pb-4 px-4 bg-yellow-400">
        <Text className="text-xl font-bold text-gray-900">
          Nearby Restaurants
        </Text>
      </View>

      {/* Map */}
      <View className="flex-1">
        {location && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation={true}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
          >
            {/* User Marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You"
            >
              <View className="items-center">
                <View className="bg-black rounded-full p-2">
                  <FontAwesome6 name="person" size={16} color="white" />
                </View>
              </View>
            </Marker>

            {/* Restaurants Markers */}
            {restaurants?.map((item: any) => (
              <Marker
                key={item.providerId}
                coordinate={{
                  latitude: item.location.lat,
                  longitude: item.location.lng,
                }}
                title={item.restaurantName}
                description={`${item.distance} km away`}
                onPress={() => setSelectedRestaurant(item)}
              >
                <View className="items-center">
                  <View className="bg-blue-500 rounded-full p-2">
                    <Ionicons
                      name="location-sharp"
                      size={18}
                      color="white"
                    />
                  </View>
                </View>
              </Marker>
            ))}

            {/* Route Line */}
            {/* {selectedRestaurant && (
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
                strokeWidth={3}
              />
            )} */}
          </MapView>
        )}
      </View>
    </SafeAreaView>
  );
}