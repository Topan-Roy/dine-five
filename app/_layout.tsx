import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
