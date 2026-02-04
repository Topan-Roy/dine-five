import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data to simulate different states based on params
// states: 'pending', 'preparing', 'ready', 'picked_up'
export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentState = (params.state as string) || "pending"; // default to pending for demo

  // State for Rating Modal
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [rating, setRating] = useState(0);

  const isCancelable = [
    "pending",
    "preparing",
    "ready",
    "ready_for_pickup",
  ].includes(currentState);

  const handleCancelPress = () => {
    if (isCancelable) {
      router.push({
        pathname: "/screens/profile/cancel-reason",
        params: { orderId: params.orderId },
      });
    }
  };

  const getTimeline = () => {
    // Simplified timeline logic for demo
    const steps = [
      { title: "Order prepared", active: currentState !== "pending" }, // vaguely mapping to images
      {
        title: "Order is ready for pickup",
        active:
          ["ready", "ready_for_pickup", "picked_up"].includes(currentState),
      },
      { title: "Order picked up", active: currentState === "picked_up" },
    ];

    // Designing the specific "Preparing your order" card look from Image 2
    // Or "Ready for pickup" card from Image 3
    return (
      <View className="ml-4 border-l-2 border-gray-100 pl-6 py-2 space-y-8 relative">
        {/* This is a custom timeline implementation to match the visual exactly */}

        {/* Step 1: Preparing */}
        <View className="relative">
          {/* Dot */}
          <View
            className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 bg-[#FFC107] border-[#FFC107] z-10`}
          />
          {currentState === "pending" || currentState === "preparing" ? (
            <View>
              <Text className="font-bold text-gray-900 text-base">
                Preparing your order
              </Text>
              <Text className="text-gray-500 text-sm mt-1 w-48">
                We are preparing your food with magic and care
              </Text>
              <Text className="text-sm font-bold text-gray-400 mt-1">
                Time Req. 7mins
              </Text>
            </View>
          ) : (
            <Text className="text-gray-300 font-bold text-base">
              Order prepared
            </Text>
          )}
        </View>

        {/* Step 2: Ready */}
        <View className="relative">
          <View
            className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${["ready", "ready_for_pickup", "picked_up"].includes(currentState) ? "bg-[#FFC107] border-[#FFC107]" : "bg-gray-100 border-gray-100"} z-10`}
          />
          {currentState === "ready" || currentState === "ready_for_pickup" ? (
            <View>
              <Text className="font-bold text-gray-900 text-base">
                Your order is Rady for pickup
              </Text>
              <Text className="text-gray-500 text-sm mt-1 w-48">
                Please head to the counter to collect your food.
              </Text>


              <TouchableOpacity className="mt-3 border border-gray-200 rounded-xl py-3 w-48 items-center">
                <Text className="font-bold text-gray-900">I'm here</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text
              className={`${["picked_up"].includes(currentState) ? "text-gray-300" : "text-gray-200"} font-bold text-base`}
            >
              Order is ready for pickup
            </Text>
          )}
        </View>

        {/* Step 3: Picked Up */}
        <View className="relative">
          <View
            className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${currentState === "picked_up" ? "bg-[#FFC107] border-[#FFC107]" : "bg-gray-100 border-gray-100"} z-10`}
          />
          {currentState === "picked_up" ? (
            <View>
              <Text className="font-bold text-gray-900 text-base">
                Order picked up
              </Text>
              <TouchableOpacity
                onPress={() => setRateModalVisible(true)}
                className="mt-3 border border-gray-200 rounded-xl py-3 w-48 items-center"
              >
                <Text className="font-bold text-gray-900">Rate the food!</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-gray-200 font-bold text-base">
              Order picked up
            </Text>
          )}
        </View>
      </View>
    );
  };

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
        <Text className="text-xl font-bold text-gray-900">Cancel order</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Restaurant Card & Cancel Button */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-gray-900 rounded-full items-center justify-center">
              <Ionicons name="restaurant" size={20} color="#FFC107" />
            </View>
            <View>
              <Text className="text-base font-bold text-gray-900">
                Restaurant Food
              </Text>
              <Text className="text-gray-500 text-sm">Jan 12, 2026</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCancelPress}
            disabled={!isCancelable}
            className={`px-4 py-2 rounded-lg ${isCancelable ? "bg-[#FFE69C]" : "bg-gray-200"}`}
          >
            <Text
              className={`font-bold ${isCancelable ? "text-[#332701]" : "text-gray-500"}`}
            >
              Cancel order
            </Text>
          </TouchableOpacity>
        </View>

        {/* Estimated Time */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text className="text-gray-500">Estimated time</Text>
          </View>
          <Text
            className={`font-bold ${currentState === "pending" ? "text-yellow-500" : "text-gray-900"}`}
          >
            {currentState === "pending" ? "Pending" : "10-20 minutes"}
          </Text>
        </View>

        {/* Timeline Card */}
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          {getTimeline()}
        </View>

        {/* Details */}
        <View className="space-y-4 mb-8">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text className="text-gray-500 text-base">Pickup at</Text>
            </View>
            <Text className="text-gray-900 font-bold text-sm underline">
              123 Main Street
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <Ionicons name="card-outline" size={20} color="#666" />
              <Text className="text-gray-500 text-base">Amount Paid</Text>
            </View>
            <Text className="text-gray-900 font-bold text-base">$32.12</Text>
          </View>
        </View>

        {/* Order Items */}
        <Text className="font-bold text-gray-900 mb-4">Your Order</Text>
        <View className="flex-row gap-4 mb-10">
          {[1, 2, 3].map((i) => (
            <View key={i} className="items-center">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150",
                }}
                className="w-16 h-16 rounded-xl mb-1"
                resizeMode="cover"
              />
              <Text className="text-sm text-gray-500">x2</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Rate Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rateModalVisible}
        onRequestClose={() => setRateModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white w-full rounded-3xl p-6 items-center">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Did you like the food!
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Please rate this food so, that we can improve it!
            </Text>

            <View className="flex-row gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? "#FFC107" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setRateModalVisible(false)}
              className="bg-gray-200 w-full py-4 rounded-xl items-center"
            >
              <Text className="text-gray-500 font-bold text-lg">Rate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
