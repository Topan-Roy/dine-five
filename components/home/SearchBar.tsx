import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

export const SearchBar = () => {
    return (
        <View className="flex-row items-center px-4 mt-3.5">
            <View className="flex-1 flex-row items-center bg-white rounded-full border border-[#FFC107E5] h-12 px-4  shadow-sm mr-3">
                <Ionicons name="search-outline" size={20} color="#555555" />
                <TextInput
                    placeholder="Search dishes, restaurants"
                    className="flex-1 ml-2 text-gray-700 h-full"
                    placeholderTextColor="#555555"
                />
                <TouchableOpacity className="w-10 h-10 bg-yellow-400 rounded-full items-center justify-center shadow-sm left-3">
                    <Ionicons name="options-outline" size={22} color="#555555" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
