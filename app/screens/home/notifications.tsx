import { EmptyState } from "@/components/common/EmptyState";
import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for notifications
const NOTIFICATIONS = {
  new: [
    {
      id: 1,
      title: "Rate Your Order",
      message:
        "How did we do? Let us know by rating your recent order and sharing your feedback.",
      time: "5 mins ago",
      icon: "fast-food",
    },
    {
      id: 2,
      title: "Hungry? Try Our New Pizza Specials!",
      message:
        "Check out the latest additions to our menu and satisfy your cravings!",
      time: "5 mins ago",
      icon: "pizza",
    },
    {
      id: 3,
      title: "Don't Miss Out: Special Offer Just for You!",
      message:
        "Get 10% off your next order with code SAVE10. Limited time only!",
      time: "22 mins ago",
      icon: "gift",
    },
  ],
  old: [
    {
      id: 4,
      title: "Order Delivered",
      message: "Your order has been successfully delivered. Enjoy your meal!",
      time: "1 day ago",
      icon: "bicycle",
    },
    {
      id: 5,
      title: "Refund Processed",
      message: "Your refund for order #12345 has been processed.",
      time: "2 days ago",
      icon: "cash",
    },
    {
      id: 6,
      title: "Hungry? Try Our New Pizza Specials!",
      message:
        "Check out the latest additions to our menu and satisfy your cravings!",
      time: "2 day ago",
      icon: "pizza",
    },
    {
      id: 7,
      title: "Don't Miss Out: Special Offer Just for You!",
      message:
        "Get 10% off your next order with code SAVE10. Limited time only!",
      time: "2 hours ago",
      icon: "gift",
    },
  ],
};

export default function NotificationScreen() {
  const router = useRouter();
  const { fetchNotifications } = useStore() as any;
  const [activeTab, setActiveTab] = useState<"new" | "old">("new");
  const [notifications, setNotifications] = useState<{
    newNotifications: any[];
    oldNotifications: any[];
  }>({
    newNotifications: [],
    oldNotifications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      if (data) {
        setNotifications({
          newNotifications: data.newNotifications || [],
          oldNotifications: data.oldNotifications || [],
        });
      }
      setLoading(false);
    };
    loadNotifications();
  }, [fetchNotifications]);

  const formatTime = (dateString: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    return date.toLocaleDateString();
  };

  const renderNotification = (item: any) => (
    <View key={item.id || item._id} className="flex-row items-start mb-6 w-full">
      <View className="w-12 h-12 bg-[#FFF3CD] rounded-full items-center justify-center mr-4">
        <Ionicons name={(item.icon || "notifications") as any} size={24} color="#FFC107" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-[#363A33] mb-1">
          {item.title}
        </Text>
        <Text className="text-[#60655C] text-sm font-normal leading-5 mb-2">
          {item.message}
        </Text>
        <Text className="text-sm font-semibold text-gray-900">
          {item.time || formatTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 z-10 p-2"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2  mt-2.5">
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        </View>
      </View>

      {/* Toggle Switch */}
      <View className="px-6 mb-8">
        <View className="flex-row bg-[#FFE69C] bg-opacity-20 rounded-xl p-1 h-14 items-center">
          <TouchableOpacity
            onPress={() => setActiveTab("new")}
            className={`flex-1 h-full items-center justify-center rounded-xl relative ${activeTab === "new" ? "bg-[#FFC107]" : "bg-transparent"}`}
          >
            <Text
              className={`text-base font-semibold ${activeTab === "new" ? "text-[#1F2A33]" : "text-[#664D03]"}`}
            >
              New
            </Text>
            {/* Red dot for new */}
            {activeTab === "old" && (
              <View className="absolute top-3 right-[35%] w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("old")}
            className={`flex-1 h-full items-center justify-center rounded-xl ${activeTab === "old" ? "bg-[#FFC107]" : "bg-transparent"}`}
          >
            <Text
              className={`text-base font-medium ${activeTab === "old" ? "text-[#1F2A33]" : "text-[#664D03]"}`}
            >
              Old
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {activeTab === "new" ? (
            notifications.newNotifications.length > 0 ? (
              notifications.newNotifications.map(renderNotification)
            ) : (
              <EmptyState
                title="No New Notifications"
                message="We'll notify you when something new arrives. Keep an eye out for updates!"
              />
            )
          ) : (
            notifications.oldNotifications.length > 0 ? (
              notifications.oldNotifications.map(renderNotification)
            ) : (
              <EmptyState
                title="No Past Notifications"
                message="Your notification history is empty. All your future activity will appear here."
              />
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
