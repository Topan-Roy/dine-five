import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyAccountScreen() {
  const router = useRouter();
  const { user, updateProfile, fetchProfile } = useStore() as any;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter state initialized with user data
  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || "Theresa Webb",
    email: user?.email || "michael.mitc@example.com",
    phone: user?.phone || "Number",
    dateOfBirth: (user?.dateOfBirth || user?.dob || "").split("T")[0] || "Optional",
    address: user?.address || "Home",
  });

  // Sync form with user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user?.name || user?.fullName || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        dateOfBirth: user.dateOfBirth
          ? user.dateOfBirth.split("T")[0]
          : user.dob
            ? user.dob.split("T")[0]
            : prev.dateOfBirth,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let dataToUpdate: any;
      if (selectedImage) {
        const form = new FormData();
        form.append("name", formData.name);
        form.append("phone", formData.phone);
        form.append("dateOfBirth", formData.dateOfBirth);
        form.append("address", formData.address);

        const filename = selectedImage.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        form.append("profilePic", {
          uri: selectedImage,
          name: filename,
          type,
        } as any);
        dataToUpdate = form;
      } else {
        dataToUpdate = {
          name: formData.name,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
        };
      }

      const result = await updateProfile(dataToUpdate);

      if (result) {
        Alert.alert("Success", "Profile updated successfully");
        setIsEditing(false);
        setSelectedImage(null);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const [isEmailVisible, setIsEmailVisible] = useState(false);

  const maskEmail = (email: string) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const renderViewItem = (label: string, value: string, icon?: string, onIconPress?: () => void) => (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!isEditing && label !== "Email"}
      onPress={() => {
        if (!isEditing && label === "Email" && onIconPress) {
          onIconPress();
        }
      }}
      className="bg-white px-5 py-4 rounded-2xl mb-4 border border-gray-50 flex-row items-center justify-between shadow-sm shadow-black/5"
    >
      <View className="flex-row items-center gap-3">
        {icon && (
          <TouchableOpacity disabled={!onIconPress} onPress={onIconPress}>
            <Ionicons name={icon as any} size={22} color="#4B5563" />
          </TouchableOpacity>
        )}
        <Text className="text-gray-700 text-base font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-gray-400 text-base mr-1" numberOfLines={1}>
          {value || (label === "Birthday" ? "Optional" : "Add info")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-6">
        <TouchableOpacity
          onPress={() => (isEditing ? setIsEditing(false) : router.back())}
          className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md shadow-black/10"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-gray-900">
          {isEditing ? "Your name" : "My Account"}
        </Text>

        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFC107" />
          ) : (
            <Text className="text-[#FFC107] font-bold text-lg">
              {isEditing ? "Save" : "Edit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Section */}
        <View className="items-center mb-10">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-xl shadow-black/10">
              <Image
                source={{
                  uri:
                    selectedImage ||
                    user?.profilePic ||
                    user?.photo ||
                    "https://i.ibb.co.com/WvT5LftP/iconprofile.jpg",
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-1 right-1 bg-white w-9 h-9 rounded-full items-center justify-center shadow-lg border border-gray-100"
              >
                <Ionicons name="camera" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          {!isEditing && (
            <View className="mt-5 items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {formData.name}
              </Text>
              <Text className="text-gray-500 text-base mt-1">
                {formData.email}
              </Text>
            </View>
          )}
        </View>

        {isEditing ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="pb-20"
          >
            <View className="gap-6">
              <View>
                <Text className="text-gray-500 text-base mb-2 font-medium">Your Name</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(v) => handleChange("name", v)}
                  placeholder="Daniel Jones"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white px-5 py-4 rounded-2xl border border-gray-100 text-lg font-normal text-gray-900 shadow-sm shadow-black/5"
                />
              </View>

              <View>
                <Text className="text-gray-500 text-base mb-2 font-medium">Number</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(v) => handleChange("phone", v)}
                  placeholder="Daniel Jones"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className="bg-white px-5 py-4 rounded-2xl border border-gray-100 text-lg font-normal text-gray-900 shadow-sm shadow-black/5"
                />
              </View>

              <View>
                <Text className="text-gray-500 text-base mb-2 font-medium">Your Birthday</Text>
                <View className="relative">
                  <TextInput
                    value={formData.dateOfBirth}
                    onChangeText={(v) => handleChange("dateOfBirth", v)}
                    placeholder="00/00/0000"
                    placeholderTextColor="#9CA3AF"
                    className="bg-white px-5 py-4 rounded-2xl border border-gray-100 text-lg font-normal text-gray-900 shadow-sm shadow-black/5"
                  />
                  {/* <View className="absolute left-4 top-[18px]">
                    <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                  </View> */}
                </View>
              </View>

              <View>
                <Text className="text-gray-500 text-base mb-2 font-medium">Your Country</Text>
                <TextInput
                  value={formData.address}
                  onChangeText={(v) => handleChange("address", v)}
                  placeholder="Home"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white px-5 py-4 rounded-2xl border border-gray-100 text-lg font-normal text-gray-900 shadow-sm shadow-black/5"
                />
              </View>

              <View>
                <Text className="text-gray-500 text-base mb-2 font-medium">Your Email</Text>
                <TextInput
                  value={formData.email}
                  editable={false}
                  placeholder="Daniel Jones"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white px-5 py-4 rounded-2xl border border-gray-100 text-lg font-normal text-gray-400 shadow-sm shadow-black/5"
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View className="pb-10">
            {renderViewItem("Name", formData.name)}
            {renderViewItem("Number", formData.phone)}
            {renderViewItem("Birthday", formData.dateOfBirth)}
            {renderViewItem("Country", formData.address)}
            {renderViewItem(
              "Email",
              isEmailVisible ? formData.email : maskEmail(formData.email),
              isEmailVisible ? "eye-outline" : "eye-off-outline",
              () => setIsEmailVisible(!isEmailVisible)
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
