import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerSupportScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{ uri: string; type: "image" | "video" }>
  >([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Good morning! We're from Boba Foods, how may I help you?",
      isSupport: true,
      time: "10:30 AM",
      attachments: [],
    },
    {
      id: 2,
      text: "I have ordered for a pepperoni cheese pizza but I have received a different. There must have been a mistake somewhere. Please replace it.",
      isSupport: false,
      time: "10:32 AM",
      attachments: [],
    },
    {
      id: 3,
      text: "The quick brown fox jumps over the lazy dog",
      isSupport: true,
      time: "10:33 AM",
      attachments: [
        {
          uri: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
          type: "image",
        },
      ],
    },
    {
      id: 4,
      text: "The quick brown fox jumps over the lazy dog",
      isSupport: false,
      time: "10:35 AM",
      attachments: [],
    },
  ]);

  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to make this work!",
      );
      return false;
    }
    return true;
  };

  // Show media selection options
  const showMediaOptions = () => {
    Alert.alert("Select Media", "Choose what you want to send", [
      {
        text: "📷 Take Photo",
        onPress: takePhoto,
      },
      {
        text: "🖼️ Choose from Library",
        onPress: pickImage,
      },
      {
        text: "🎥 Record Video",
        onPress: recordVideo,
      },
      {
        text: "📹 Choose Video from Library",
        onPress: pickVideo,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Take photo
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments([
        ...attachments,
        { uri: result.assets[0].uri, type: "image" },
      ]);
    }
  };

  // Pick image from library
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments([
        ...attachments,
        { uri: result.assets[0].uri, type: "image" },
      ]);
    }
  };

  // Record video
  const recordVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments([
        ...attachments,
        { uri: result.assets[0].uri, type: "video" },
      ]);
    }
  };

  // Pick video from library
  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAttachments([
        ...attachments,
        { uri: result.assets[0].uri, type: "video" },
      ]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Send message with attachments
  const handleSendMessage = () => {
    console.log("Send button clicked!");
    console.log("Message:", message);
    console.log("Attachments:", attachments);

    if (message.trim() || attachments.length > 0) {
      const newMessage = {
        id: messages.length + 1,
        text: message.trim(),
        isSupport: false,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments: [...attachments],
      };
      console.log("New message:", newMessage);
      setMessages([...messages, newMessage]);
      setMessage("");
      setAttachments([]);
      console.log("Message sent and cleared!");
    } else {
      console.log("Cannot send empty message");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-center pt-4 pb-6 relative px-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-6 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">
          Customer Support
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Dynamic Chat Messages */}
        {messages.map((msg) => (
          <View key={msg.id} className="mb-4">
            <View
              className={`flex-row ${msg.isSupport ? "justify-start" : "justify-end"}`}
            >
              <View
                className={`max-w-[80%] ${msg.isSupport ? "order-2" : "order-1"}`}
              >
                <View
                  className={`rounded-2xl px-4 py-3 ${
                    msg.isSupport
                      ? "bg-white rounded-tl-none shadow-sm"
                      : "bg-[#F3F4F6] rounded-tr-none"
                  }`}
                >
                  <Text className="text-gray-700 leading-5">{msg.text}</Text>

                  {/* Message Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <View className="mt-2">
                      {msg.attachments.map((attachment, index) => (
                        <View key={index} className="mb-2">
                          {attachment.type === "image" ? (
                            <Image
                              source={{ uri: attachment.uri }}
                              className=" h-32 w-32 rounded-xl"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="relative">
                              <Video
                                source={{ uri: attachment.uri }}
                                className="w-44 h-44 rounded-xl"
                                useNativeControls
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay={false}
                              />
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Text
                  className={`text-xs text-gray-500 mt-1 ${
                    msg.isSupport ? "text-left" : "text-right"
                  }`}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* WhatsApp-style Attachment Preview Above Send Button */}
        {attachments.length > 0 && (
          <View className="mb-4">
            <View className="bg-white rounded-2xl p-3 shadow-sm">
              <View className="flex-row flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <View key={index} className="relative">
                    {attachment.type === "image" ? (
                      <Image
                        source={{ uri: attachment.uri }}
                        className="w-16 h-16 rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="relative">
                        <Video
                          source={{ uri: attachment.uri }}
                          className="w-20 h-20 rounded-lg"
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={false}
                          isMuted
                        />
                        <View className="absolute inset-0 bg-black bg-opacity-30 rounded-lg items-center justify-center">
                          <Ionicons name="play" size={12} color="white" />
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => removeAttachment(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                    >
                      <Ionicons name="close" size={10} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Typing indicator placeholder */}
        <View className="self-start bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm mb-4">
          <View className="flex-row gap-1">
            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </View>
        </View>

        {/* Space at bottom for input */}
        <View className="h-4" />
      </ScrollView>

      {/* Input Field */}
      <View className="px-6 pb-6 bg-white border-t border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={showMediaOptions}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="add" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View className="flex-1 bg-gray-50 rounded-full px-4 py-3">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type here..."
              placeholderTextColor="#9CA3AF"
              className="text-gray-900"
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            className={`w-10 h-10 rounded-full items-center justify-center shadow-sm ${
              message.trim() || attachments.length > 0
                ? "bg-[#FFC107]"
                : "bg-gray-300"
            }`}
          >
            <Ionicons
              name="send"
              size={18}
              color={
                message.trim() || attachments.length > 0 ? "#fff" : "#8E8E93"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
