import GradientButton from "@/components/GradientButton";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, View } from "react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSendEmail = () => {
    console.log("Email:", email);
    router.push("/(auth)/verify-otp");
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
        {/* Forgot Password form */}
        <View className="pt-5 px-5 pb-10 bg-white/90 rounded-t-2xl">
          <Text className="text-2xl font-bold text-center mb-4">
            Forgot Password?
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Don't worry! It happens. Please enter the email address associated
            with your account.
          </Text>

          {/* Email input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Continue button */}
          <GradientButton
            title="Continue"
            onPress={handleSendEmail}
            className="w-full mb-4 mt-14"
          />

          {/* Back to login */}
          {/* <View className="flex-row justify-center">
            <Text className="text-gray-600">Remember your password? </Text>
            <TouchableOpacity>
              <Text className="text-yellow-600 font-medium">Log In</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </ImageBackground>
    </View>
  );
};

export default ForgotPassword;
