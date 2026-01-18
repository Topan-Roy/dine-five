import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          width: "60%",
          marginHorizontal: "20%",
          backgroundColor: "rgba(255, 255, 255, 0.70)", // 90% transparent white
          borderRadius: 100,
          height: 58,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          // Shadow for iOS
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          // Shadow for Android
          elevation: 5,
        },
        tabBarShowLabel: false, // Hide labels, শুধু icons দেখাবে
        tabBarActiveTintColor: "#FFC107", // Yellow color যেমন আপনার design এ
        tabBarInactiveTintColor: "#332701",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "bg-yellow-400 h-12 w-12 rounded-full" : ""
              }`}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={30}
                color={focused ? "#fff" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="location"
        options={{
          title: "Location",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "bg-yellow-400 h-12 w-12 rounded-full" : ""
              }`}
            >
              <Ionicons
                name={focused ? "location" : "location-outline"}
                size={30}
                color={focused ? "#fff" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="card"
        options={{
          title: "Card",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "bg-yellow-400 h-12 w-12 rounded-full" : ""
              }`}
            >
              <Ionicons
                name={focused ? "cart" : "cart-outline"}
                size={30}
                color={focused ? "#fff" : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? "bg-yellow-400 h-12 w-12 rounded-full" : ""
              }`}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={30}
                color={focused ? "#fff" : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
