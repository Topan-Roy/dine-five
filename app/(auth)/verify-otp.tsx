import CustomInput from "@/components/CustomInput";
import GradientButton from "@/components/GradientButton";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ImageBackground, Text, View } from "react-native";

const VerifyOTP = () => {
  const hendleVerifyOTP = () => {
    router.push("/(auth)/reset-password");
  };

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <ImageBackground
        source={require("@/assets/images/splash-screen.png")}
        resizeMode="cover"
        style={{ flex: 1, width: "100%", height: "100%" }}
      >
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/splash-logo.svg")}
            contentFit="contain"
            style={{
              height: 200,
              width: 200,
              backgroundColor: "#00000010",
              paddingBottom: 5,
              borderRadius: 100,
            }}
          />
        </View>
        {/* OTP Verification form */}
        <View className="pt-5 px-5 pb-10 bg-white/90 rounded-t-2xl">
          <Text className="text-2xl font-bold text-center mb-4">
            Enter Verification Code
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            We have sent a verification code to your email address. Please enter
            the code below.
          </Text>

          {/* OTP Input Fields */}
          <CustomInput
            label="Enter Verification Code."
            className="mt-2"
            placeholder="123456"
          />

          {/* Verify button */}
          <GradientButton
            title="Verify"
            onPress={hendleVerifyOTP}
            className="w-full mb-4 mt-14"
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default VerifyOTP;
