import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CancelOrderScreen() {
    const router = useRouter();

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
                <Text className="text-xl font-bold text-gray-900">Cancel order</Text>
            </View>

            <ScrollView className="flex-1 px-6">
                <Text className="text-xl font-bold text-gray-900 mb-2">We are sorry to hear this</Text>
                <Text className="text-gray-500 leading-6 mb-6">
                    Tell us why you choose to cancel your order, is the reason from our side?{'\n'}
                    Write down your reason to cancel your order:
                </Text>

                <View className="bg-white p-4 rounded-2xl border border-gray-100 h-48">
                    <TextInput
                        placeholder="Write here..."
                        multiline
                        textAlignVertical="top"
                        className="flex-1 text-base text-gray-900"
                    />
                    <Text className="text-right text-gray-400 text-xs mt-2">0 / 220</Text>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="p-6">
                <TouchableOpacity
                    onPress={() => router.back()} // Or submit logic
                    className="bg-yellow-400 w-full py-4 rounded-2xl items-center shadow-sm">
                    <Text className="text-gray-900 font-bold text-lg">Submit</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
