import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const GoogleLogin = () => {
  return (
    <TouchableOpacity className="mt-7 flex-row items-center justify-center gap-4 border border-[#EDEDED] bg-white rounded-2xl py-3 mb-10">
      <Image
        source={require("@/assets/images/google.svg")}
        contentFit="contain"
        style={{ height: 23, width: 23 }}
      />
      <Text className="font-medium text-[#1F2A33]">Continue with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleLogin;
