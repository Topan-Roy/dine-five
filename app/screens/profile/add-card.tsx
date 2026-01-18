import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddCardScreen() {
    const router = useRouter();
    const [isDefault, setIsDefault] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Add a card</Text>
            </View>

            <ScrollView className="flex-1 px-6">

                {/* Set Default Switch */}
                <View className="flex-row justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-gray-100">
                    <Text className="text-base font-semibold text-gray-900">Set as default</Text>
                    <Switch
                        trackColor={{ false: "#E5E7EB", true: "#FFC107" }}
                        thumbColor={isDefault ? "#fff" : "#f4f3f4"}
                        onValueChange={setIsDefault}
                        value={isDefault}
                    />
                </View>

                {/* Form */}
                <View className="space-y-4">
                    <TextInput
                        placeholder="Cardholder name"
                        placeholderTextColor="#9CA3AF"
                        className="bg-white p-4 rounded-2xl border border-gray-100 text-base text-gray-900"
                    />
                    <TextInput
                        placeholder="Card number"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        className="bg-white p-4 rounded-2xl border border-gray-100 text-base text-gray-900"
                    />
                    <TextInput
                        placeholder="Expiration date"
                        placeholderTextColor="#9CA3AF"
                        className="bg-white p-4 rounded-2xl border border-gray-100 text-base text-gray-900"
                    />
                    <TextInput
                        placeholder="CVV"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        className="bg-white p-4 rounded-2xl border border-gray-100 text-base text-gray-900"
                    />
                </View>

            </ScrollView>

            {/* Save Button */}
            <View className="p-6">
                {/* Using gray style as per image untill filled? Or default style. Image shows light gray button 'Save' */}
                <TouchableOpacity
                    className="bg-gray-200 w-full py-4 rounded-2xl items-center">
                    <Text className="text-gray-500 font-bold text-lg">Save</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
