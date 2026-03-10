import { Toast } from "@/components/common/Toast";
import { useStore } from "@/stores/stores";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

import * as Notifications from "expo-notifications";

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { isInitialized, initializeAuth, fetchNotifications, user } = useStore() as any;
  const notifiedIdSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    initializeAuth();
    setupNotifications();
  }, []);

  useEffect(() => {
    let interval: any;
    // console.log("Checking Auth State:", { isInitialized, hasUser: !!user });

    if (isInitialized && user) {
      // console.log("🚀 Notification polling started (3s interval)");

      interval = setInterval(() => {
        checkNewNotifications();
      }, 3000);
    }
    return () => {
      if (interval) {
        // console.log("🛑 Notification polling stopped");
        clearInterval(interval);
      }
      // logic removed: notifiedIdSet.current.clear(); 
      // We keep the set so we don't notify the same IDs again if the interval restarts
    };
  }, [isInitialized, user]);

  const setupNotifications = async () => {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FFC107",
          enableVibrate: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
        // console.log("✅ Android Notification Channel Setup Done (MAX Importance)");
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      // console.log("🔔 Notification Permission Status:", finalStatus);
    } catch (error) {
      // console.log("❌ Push Setup Error:", error);
    }
  };

  const isFirstFetch = useRef(true);

  const checkNewNotifications = async () => {
    try {
      const state = useStore.getState() as any;
      const data = await state.fetchNotifications(true);

      if (data) {
        // Collect all potential notifications from any array the API sends
        const allNotifs = [
          ...(data.newNotifications || []),
          ...(data.oldNotifications || []),
          ...(Array.isArray(data) ? data : [])
        ];

        for (const notif of allNotifs) {
          // Fix: API uses 'notificationId'
          const id = notif.notificationId || notif._id || notif.id;

          if (id && !notifiedIdSet.current.has(id)) {
            if (isFirstFetch.current) {
              // Silently record existing IDs on first load
              notifiedIdSet.current.add(id);
            } else {
              // Truly NEW notification - trigger alert
              // console.log(`🔔 NEW NOTIF DETECTED: ${notif.title}`);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: notif.title || "Order Update",
                  body: notif.message || "New message received",
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: null,
              });

              notifiedIdSet.current.add(id);
            }
          }
        }

        // After the first loop, mark first fetch as done
        if (isFirstFetch.current) {
          isFirstFetch.current = false;
        }
      }
    } catch (e) {
      // console.log("❌ Polling Error:", e);
    }
  };

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
