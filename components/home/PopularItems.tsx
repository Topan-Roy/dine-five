import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const ITEMS = [
    { id: 1, name: 'Delicious cheese pizza', price: '5.99', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', isNew: true },
    { id: 2, name: 'Delicious cheese pizza', price: '5.99', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', isNew: true },
    { id: 3, name: 'Delicious cheese pizza', price: '5.99', image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500', isNew: false },
    { id: 4, name: 'Delicious cheese pizza', price: '5.99', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500', isNew: false },
];

export const PopularItems = ({
    onAddItem,
    searchText = ''
}: {
    onAddItem: (price: string) => void;
    searchText?: string;
}) => {
    const filteredItems = ITEMS.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    if (searchText && filteredItems.length === 0) return null;

    return (
        <View className="px-4">
            <View className="flex-row flex-wrap justify-between">
                {filteredItems.map((item) => (
                    <View key={item.id} className="w-[48%] mt-4  bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100">
                        <View className="relative">
                            <Image
                                source={{ uri: item.image }}
                                className="w-full h-32 rounded-xl"
                                resizeMode="cover"
                            />
                            {item.isNew && (
                                <View className="absolute top-2 left-2 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
                                    <Text className="text-xs font-normal text-pink-500">NEW</Text>
                                </View>
                            )}
                        </View>

                        <Text className="text-sm font-normal text-[#122511] mt-2 leading-tight">
                            {item.name}
                        </Text>

                        <View className="flex-row items-center justify-between mt-2">
                            <View className="bg-yellow-400 px-2.5 py-1 rounded-full">
                                <Text className="text-sm font-normal text-[#122511]">${item.price}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => onAddItem(item.price)}
                                className="w-7 h-7 bg-[#FFE69C] rounded-full items-center justify-center">
                                <Ionicons name="add" size={18} color="#332701" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};
