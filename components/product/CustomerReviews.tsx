import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

interface Review {
  _id?: string;
  id?: string;
  customerId?: {
    fullName: string;
    profilePic?: string;
  };
  name?: string;
  profileImage?: string;
  rating: number;
  comment?: string;
  description?: string;
  createdAt?: string;
  date?: string;
}

interface CustomerReviewsProps {
  reviews?: Review[];
}

export const CustomerReviews = ({ reviews = [] }: CustomerReviewsProps) => {
  if (reviews.length === 0) {
    return (
      <View className="mb-4 items-center py-4">
        <Text className="text-gray-400 text-sm italic">No reviews yet for this item.</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-[#1F2A33] mb-4">Customer Reviews</Text>
      {reviews.map((review) => {
        const reviewId = review._id || review.id || Math.random().toString();
        const displayName = review.name || review.customerId?.fullName || "Anonymous User";
        const profilePic = review.profileImage || review.customerId?.profilePic || "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150";
        const reviewComment = review.comment || review.description || "";
        const reviewDate = review.date || review.createdAt || new Date().toISOString();

        return (
          <View key={reviewId} className="flex-row items-start mb-6">
            <Image
              source={{ uri: profilePic }}
              style={{ height: 50, width: 50, borderRadius: 100 }}
              contentFit="cover"
            />
            <View className="flex-1 ml-4">
              <Text className="text-sm font-semibold text-[#1F2A33] mb-1">
                {displayName}
              </Text>

              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={14}
                      color={star <= review.rating ? "#FFC107" : "#E5E7EB"}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                <Text className="text-xs text-gray-400 ml-2">
                  {new Date(reviewDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <Text className="text-[#7A7A7A] text-sm leading-5">
                {reviewComment}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
