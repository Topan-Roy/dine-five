import { useStore } from "@/stores/stores";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";

const SplashScreen = () => {
  const { user, accessToken, initializeAuth } = useStore() as any;

  useEffect(() => {
    let timer: any;

    const init = async () => {
      // Ensure auth is initialized from storage
      const auth = await initializeAuth();

      timer = setTimeout(() => {
        if (auth && auth.user && auth.accessToken) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(step)/step1");
        }
      }, 2000);
    };

    init();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []); // Only run on mount


  return (
    <Image
      source={require("@/assets/images/image2.png")}
      contentFit="cover"
      style={{ flex: 1, width: "100%", height: "100%" }}
    />
  );
};

export default SplashScreen;
