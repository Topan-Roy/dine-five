import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Payment</Text>

        <TouchableOpacity
          onPress={() => router.push("/screens/profile/add-card")}
          className="absolute right-4 w-10 h-10 bg-[#FFC107] rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="add" size={24} color="#332701" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Default */}
        <Text className="text-gray-500 text-sm mb-3 ml-1">Default</Text>
        <TouchableOpacity className="bg-white p-4 rounded-2xl mb-6 flex-row justify-between items-center border border-gray-100 shadow-sm">
          <Text className="text-base font-semibold text-gray-900">
            Mastercard - Daniel Jones
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Others */}
        <Text className="text-gray-500 text-sm mb-3 ml-1">Others</Text>
        <TouchableOpacity className="bg-white p-4 rounded-2xl mb-4 flex-row justify-between items-center border border-gray-100 shadow-sm">
          <Text className="text-base font-semibold text-gray-900">
            Mastercard - Emily Jones
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
