import GradientButton from "@/components/GradientButton";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        {/* Reset Password form */}
        <View className="pt-5 px-5 pb-10 bg-white/90 rounded-t-2xl">
          <Text className="text-2xl font-bold text-center mb-4">
            Now Reset Your Password.
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Password must have 6-8 characters.
          </Text>

          {/* New Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">New Password</Text>
            <View className="relative">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 pr-12"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
              >
                <Text className="text-gray-600">
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Confirm Password</Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 pr-12"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5"
              >
                <Text className="text-gray-600">
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset button */}
          <GradientButton
            title="Reset Password"
            onPress={() => console.log("Reset Password")}
            className="w-full mb-4 mt-14"
          />

          {/* Back to Login */}
          {/* <View className="flex-row justify-center">
            <TouchableOpacity>
              <Text className="text-yellow-600 font-medium">Back to Login</Text>
            </TouchableOpacity> */}
          {/* </View> */}
        </View>
      </ImageBackground>
    </View>
  );
};

export default ResetPassword;
