import GradientButton from "@/components/GradientButton";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const step3 = () => {
  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Full screen image background */}
      <View className="flex-1 relative">
        <ImageBackground
          source={require("@/assets/images/stap3.png")}
          resizeMode="cover"
          className="flex-1"
        >
          {/* Skip button */}
          <View className="absolute top-12 right-6">
            <TouchableOpacity onPress={() => router.push("/(step)/step2")}>
              <Text className="text-base font-medium text-[#FFCD39]">Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Progress indicators - Step 3 active */}
          <View className="flex-row justify-between items-center px-6 pt-14">
            <View className="flex-row gap-2">
              <View className="w-28 h-2 bg-gray-400 rounded-full" />
              <View className="w-28 h-2 bg-gray-400 rounded-full" />
              <View className="w-28 h-2 bg-yellow-400 rounded-full" />
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom section - increased height and reduced pb to move button up */}
      <View className="h-[320px] bg-white px-6 pt-8 pb-6">
        {/* Progress indicators above title */}
        <View className="flex-row justify-center gap-2 mb-4">
          <View className="w-6 h-2 bg-gray-200 rounded-full" />
          <View className="w-6 h-2 bg-gray-200 rounded-full" />
          <View className="w-10 h-2 bg-yellow-400 rounded-full" />
        </View>

        {/* Title */}
        <Text className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Ready to Pick Up
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-600 leading-relaxed mb-8 text-center">
          No delivery, no waiting at home. Just browse, claim your meal, and
          head over to the shop to collect it.
        </Text>

        {/* Get Started button - full width */}
        <GradientButton
          title="Get Started"
          onPress={() => router.push("/(auth)/login")}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default step3;
