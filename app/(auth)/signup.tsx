import SignupComponents from "@/components/SignupComponents";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ImageBackground, View } from "react-native";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <View className="flex-1">
      <StatusBar style="auto" />
      <ImageBackground
        source={require("@/assets/images/Screenshot.png")}
        resizeMode="cover"
        style={{ flex: 1, width: "100%", height: "100%" }}
      >
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/logo.jpg")}
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
        {/* Login form */}
        <SignupComponents />
      </ImageBackground>
    </View>
  );
};

export default Signup;
