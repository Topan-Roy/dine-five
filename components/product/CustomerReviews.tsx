import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const REVIEWS = [
  {
    id: 1,
    name: "Grilled Salmon",
    date: "May 20, 2020",
    rating: 4,
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.",
    avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150",
  },
  {
    id: 2,
    name: "Kenneth Erickson",
    date: "May 22, 2020",
    rating: 5,
    text: "Great taste and very fast delivery! simpler text of the printing and typesetting industry.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    id: 3,
    name: "Maria Calzoni",
    date: "June 01, 2020",
    rating: 4,
    text: "Absolutely delicious, will order again.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
];

export const CustomerReviews = () => {
  return (
    <View className="mb-4">
      {REVIEWS.map((review) => (
        <View key={review.id} className="flex-row items-start mb-6">
          <Image
            source={{ uri: review.avatar }}
            style={{ height: 50, width: 50, borderRadius: 100 }}
            contentFit="cover"
          />
          <View className="flex-1 ml-4">
            <Text className="text-sm font-normal text-[#1F2A33] mb-1">
              {review.name}
            </Text>

            <View className="flex-row items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? "star" : "star"}
                  size={16}
                  color={star <= review.rating ? "#FFC107" : "#E5E7EB"}
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text className="text-sm text-gray-500 ml-2">{review.date}</Text>
            </View>

            <Text className="text-[#7A7A7A] text-sm leading-5">
              {review.text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
