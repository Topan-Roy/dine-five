import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyAccountScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Filter state
  const [formData, setFormData] = useState({
    name: "Theresa Webb",
    email: "michael.mitc@example.com",
    phone: "555-0128",
    phonePrefix: "+1",
    dob: "12-10-1996",
    address: "King kong",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Account</Text>

        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          className="absolute right-4 text-yellow-500"
        >
          <Text className="text-[#FFC107] font-bold text-lg">
            {isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* User Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            {isEditing && (
              <TouchableOpacity className="absolute bottom-0 right-0 bg-gray-900 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mt-4">
            {formData.name}
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            {formData.email}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-5">
          {/* Name Field (shown as read-only label in view mode, could be input in edit mode) */}
          {isEditing ? (
            <View>
              <Text className="text-gray-500 text-sm mb-1 ml-1">Name</Text>
              <TextInput
                value={formData.name}
                onChangeText={(t) => handleChange("name", t)}
                className="bg-white p-4 rounded-xl border border-gray-100 text-base font-normal text-gray-900"
              />
            </View>
          ) : (
            <View className="bg-white p-4 rounded-xl border border-gray-100">
              <Text className="text-base font-normal text-gray-900">
                {formData.name}
              </Text>
            </View>
          )}

          {/* Phone Field */}
          <View className="mt-4">
            {isEditing && (
              <Text className="text-gray-500 text-sm mb-1 ml-1">
                Phone Number
              </Text>
            )}
            <View className="flex-row gap-3">
              <View className="bg-white p-4 rounded-xl border border-gray-100 items-center justify-center">
                <Text className="text-base font-normal text-gray-900">
                  {formData.phonePrefix}
                </Text>
              </View>
              <View className="flex-1 bg-white p-4 rounded-xl border border-gray-100 justify-center">
                {isEditing ? (
                  <TextInput
                    value={formData.phone}
                    onChangeText={(t) => handleChange("phone", t)}
                    keyboardType="phone-pad"
                    className="text-base font-normal text-gray-900 p-0"
                  />
                ) : (
                  <Text className="text-base font-normal text-gray-900">
                    {formData.phone}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* DOB Field */}
          <View className="mt-4">
            {isEditing && (
              <Text className="text-gray-500 text-sm mb-1 ml-1">
                Date of Birth
              </Text>
            )}
            <View className="bg-white p-4 rounded-xl border border-gray-100">
              {isEditing ? (
                <TextInput
                  value={formData.dob}
                  onChangeText={(t) => handleChange("dob", t)}
                  placeholder="DD-MM-YYYY"
                  className="text-base font-normal text-gray-900 p-0"
                />
              ) : (
                <Text className="text-base font-normal text-gray-900">
                  {formData.dob}
                </Text>
              )}
            </View>
          </View>

          {/* Address Field */}
          <View className="mt-4">
            {isEditing && (
              <Text className="text-gray-500 text-sm mb-1 ml-1">Address</Text>
            )}
            <View className="bg-white p-4 rounded-xl border border-gray-100 flex-row justify-between items-center">
              {isEditing ? (
                <TextInput
                  value={formData.address}
                  onChangeText={(t) => handleChange("address", t)}
                  className="flex-1 text-base font-normal text-gray-900 p-0"
                />
              ) : (
                <Text className="text-base font-normal text-gray-900">
                  Address - {formData.address}
                </Text>
              )}
              {!isEditing && (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
