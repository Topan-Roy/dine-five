import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { RestaurantCard } from './RestaurantCard';

interface Restaurant {
    id: number;
    name: string;
    lat: number;
    lng: number;
    rating: number;
    distance: string;
    cuisine: string;
    image: string;
}

// Mock Data
const RESTAURANTS: Restaurant[] = [
    {
        id: 1,
        name: 'Kabab House',
        lat: 23.7808, // Mohakhali center
        lng: 90.4067,
        rating: 4.5,
        distance: '0.3 km',
        cuisine: 'Pakistani',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200'
    },
    {
        id: 2,
        name: 'Pizza Hut',
        lat: 23.7825, // Mohakhali C/A এর কাছে
        lng: 90.4085,
        rating: 4.2,
        distance: '0.5 km',
        cuisine: 'Italian',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200'
    },
    {
        id: 3,
        name: 'Burger King',
        lat: 23.7790, // Wireless Gate এর কাছে
        lng: 90.4050,
        rating: 4.0,
        distance: '0.4 km',
        cuisine: 'American',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'
    },
    {
        id: 4,
        name: 'KFC',
        lat: 23.7850, // Bashundhara City এর দিকে
        lng: 90.4100,
        rating: 4.6,
        distance: '0.8 km',
        cuisine: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200'
    },
    {
        id: 5,
        name: 'Dominos',
        lat: 23.7775, // TB Gate এর কাছে
        lng: 90.4030,
        rating: 4.3,
        distance: '0.6 km',
        cuisine: 'Pizza',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200'
    },
    {
        id: 6,
        name: 'Chillox',
        lat: 23.7820, // Mohakhali DOHS এর কাছে
        lng: 90.4120,
        rating: 4.4,
        distance: '0.7 km',
        cuisine: 'Chinese',
        image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=200'
    },
    {
        id: 7,
        name: 'Kacchi Bhai',
        lat: 23.7795, // Wireless রেলগেট এর কাছে
        lng: 90.4075,
        rating: 4.7,
        distance: '0.2 km',
        cuisine: 'Bangladeshi',
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200'
    },
    {
        id: 8,
        name: 'Thai Express',
        lat: 23.7835, // Banani Link Road এর দিকে
        lng: 90.4095,
        rating: 4.1,
        distance: '0.9 km',
        cuisine: 'Thai',
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=200'
    },
];


export const RestaurantMap = () => {
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                // Try getting last known position first for speed
                let lastKnown = await Location.getLastKnownPositionAsync({});
                if (lastKnown) {
                    setLocation(lastKnown.coords);
                    setLoading(false);
                }

                // Then try current position
                let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setLocation(loc.coords);
                setLoading(false);
            } catch (error) {
                console.log("Could not fetch active location, falling back to default.");
                // Fallback to default location (Dhaka) if location services fail (common in emulators)
                setLocation({
                    latitude: 23.8103,
                    longitude: 90.4125,
                    altitude: 0,
                    accuracy: 0,
                    altitudeAccuracy: 0,
                    heading: 0,
                    speed: 0
                });
                setLoading(false);
            }
        })();
    }, []);

    const handleMarkerPress = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        mapRef.current?.animateToRegion({
            latitude: restaurant.lat,
            longitude: restaurant.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        } as Region, 500);
    };

    const goToMyLocation = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            } as Region, 1000);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#FDFBF7]">
                <ActivityIndicator size="large" color="#FFC107" />
                <Text className="mt-4 text-gray-600">Loading map...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 rounded-3xl overflow-hidden bg-gray-100">
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: location?.latitude || 23.8103,
                    longitude: location?.longitude || 90.4125,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
            >
                {RESTAURANTS.map((restaurant) => (
                    <Marker
                        key={restaurant.id}
                        coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
                        onPress={() => handleMarkerPress(restaurant)}
                    >
                        <View className="items-center">
                            <View className="bg-white w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-sm">
                                <Ionicons name="restaurant" size={20} color="#FFC107" />
                            </View>
                            {/* Optional: Add a rating bubble or pointer */}
                            <View className="bg-[#FFC107] px-2 py-0.5 rounded-full mt-1">
                                <Text className="text-[10px] font-bold text-gray-900">{restaurant.rating}</Text>
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* My Location Button */}
            <TouchableOpacity
                onPress={goToMyLocation}
                className="absolute top-4 right-4 bg-white w-12 h-12 rounded-full items-center justify-center shadow-lg"
            >
                <Ionicons name="locate" size={24} color="#333" />
            </TouchableOpacity>

            {/* Restaurant Info Card */}
            {selectedRestaurant && (
                <RestaurantCard
                    restaurant={selectedRestaurant}
                    onClose={() => setSelectedRestaurant(null)}
                />
            )}
        </View>
    );
};
