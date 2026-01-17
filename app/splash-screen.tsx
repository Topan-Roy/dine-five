import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ImageBackground, View } from "react-native";

const SplashScreen = () => {
  useEffect(() => {
    const time = setTimeout(() => {
      router.push("/(step)/step1");
    }, 2000);

    return () => clearTimeout(time);
  }, []);
  return (
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
            height: 320,
            width: 320,
          }}
        />
      </View>
    </ImageBackground>
  );
};

export default SplashScreen;
