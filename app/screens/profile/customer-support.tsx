import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerSupportScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Customer Support</Text>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {/* Chat Bubbles */}

                {/* Left Bubble (Support) */}
                <View className="self-start bg-white rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm mb-4">
                    <Text className="text-gray-600 leading-5">
                        Good morning! We're from Boba Foods, how may I help you?
                    </Text>
                </View>

                {/* Right Bubble (User) */}
                <View className="self-end bg-[#F3F4F6] rounded-2xl rounded-tr-none p-4 max-w-[80%] mb-4">
                    <Text className="text-gray-600 leading-5">
                        I have ordered for a pepperoni cheese pizza but I have received a different. There must have been a mistake somewhere. Please replace it.
                    </Text>
                </View>

                {/* Left Bubble (Support) */}
                <View className="self-start bg-white rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm mb-4">
                    <Text className="text-gray-600 leading-5 mb-3">
                        The quick brown fox jumps over the lazy dog
                    </Text>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' }}
                        className="w-full h-32 rounded-xl"
                        resizeMode="cover"
                    />
                </View>

                {/* Right Bubble (User) */}
                <View className="self-end bg-[#F3F4F6] rounded-2xl rounded-tr-none p-4 max-w-[80%] mb-4">
                    <Text className="text-gray-600 leading-5">
                        The quick brown fox jumps over the lazy dog
                    </Text>
                </View>

                {/* Typing indicator placeholder */}
                <View className="self-start bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm mb-4">
                    <View className="flex-row gap-1">
                        <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </View>
                </View>

            </ScrollView>

            {/* Input Field */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className="p-4 bg-white border-t border-gray-100 flex-row items-center gap-3">
                    <TouchableOpacity>
                        <Ionicons name="add" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                    <View className="flex-1 bg-gray-50 rounded-full px-4 py-3">
                        <TextInput
                            placeholder="Type here..."
                            className="text-gray-900"
                        />
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-[#FFC107] rounded-full items-center justify-center">
                        <Ionicons name="send" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
