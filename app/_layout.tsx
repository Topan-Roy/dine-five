import { Toast } from "@/components/common/Toast";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

import { useStore } from "@/stores/stores";
import { useEffect } from "react";

export default function RootLayout() {
  const { isInitialized, initializeAuth } = useStore() as any;

  useEffect(() => {
    initializeAuth();
  }, []);

  if (!isInitialized) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
