import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ITEMS = [
  {
    id: "account",
    title: "My Account",
    icon: "person-outline",
    route: "/screens/profile/my-account",
  },
  {
    id: "orders",
    title: "My Orders",
    icon: "reader-outline", // list icon lookalike
    route: "/screens/profile/my-orders",
  },
  {
    id: "payment",
    title: "Payment",
    icon: "card-outline",
    route: "/screens/profile/payment",
  },
  {
    id: "settings",
    title: "Settings",
    icon: "settings-outline",
    route: "/screens/profile/settings",
  },
];

export default function ProfileScreen() {
  const { user } = useStore() as any;
  const router = useRouter();

  console.log("User in Profile:", user?.fullName || user?.name);

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header Title */}
      <View className="items-center py-4 relative">
        <Text className="text-xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-6 ">
        {/* User Info */}
        <View className=" mb-10 mt-4 flex-row items-center gap-4">
          <View className="w-20 h-20 rounded-full mb-4 overflow-hidden shadow-sm">
            <Image
              source={{
                uri:
                  user?.profilePic ||
                  user?.avatar ||
                  user?.photo ||
                  user?.image ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
              }}
              style={{ height: 80, width: 80, borderRadius: 100 }}
              contentFit="cover"
            />
          </View>
          <View>
            <Text className="text-2xl font-bold text-gray-900 ">
              {user?.name || "User"}
            </Text>
            <Text className="text-gray-500 text-base  mt-1">
              {user?.email || "No email provided"}
            </Text>
          </View>
        </View>

        {/* Genearl Section */}
        <Text className="text-[#70756B] text-sm font-normal mb-4">General</Text>

        {/* Menu List */}
        <View className="space-y-6">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center justify-between py-2"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                  <Ionicons name={item.icon as any} size={20} color="#000" />
                </View>
                <Text className="text-sm font-normal text-[#1F2A33]">
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
