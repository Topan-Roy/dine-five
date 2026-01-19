import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerSupportScreen() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<Array<{uri: string, type: 'image' | 'video'}>>([]);

    // Request permissions
    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
            return false;
        }
        return true;
    };

    // Show media selection options
    const showMediaOptions = () => {
        Alert.alert(
            'Select Media',
            'Choose what you want to send',
            [
                {
                    text: '📷 Take Photo',
                    onPress: takePhoto
                },
                {
                    text: '🖼️ Choose from Library',
                    onPress: pickImage
                },
                {
                    text: '🎥 Record Video',
                    onPress: recordVideo
                },
                {
                    text: '📹 Choose Video from Library',
                    onPress: pickVideo
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
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
            setAttachments([...attachments, { uri: result.assets[0].uri, type: 'image' }]);
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
            setAttachments([...attachments, { uri: result.assets[0].uri, type: 'image' }]);
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
            setAttachments([...attachments, { uri: result.assets[0].uri, type: 'video' }]);
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
            setAttachments([...attachments, { uri: result.assets[0].uri, type: 'video' }]);
        }
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center justify-center pt-4 pb-6 relative px-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-6 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">Customer Support</Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Chat Bubbles */}

                {/* Left Bubble (Support) */}
                <View className="self-start bg-white rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm mb-4">
                    <Text className="text-gray-700 leading-5">
                        Good morning! We're from Boba Foods, how may I help you?
                    </Text>
                </View>

                {/* Right Bubble (User) */}
                <View className="self-end bg-[#F3F4F6] rounded-2xl rounded-tr-none p-4 max-w-[80%] mb-4">
                    <Text className="text-gray-700 leading-5">
                        I have ordered for a pepperoni cheese pizza but I have received a different. There must have been a mistake somewhere. Please replace it.
                    </Text>
                </View>

                {/* Left Bubble (Support) */}
                <View className="self-start bg-white rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm mb-4">
                    <Text className="text-gray-700 leading-5 mb-3">
                        The quick brown fox jumps over the lazy dog
                    </Text>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' }}
                        className="w-full h-32 rounded-xl"
                        resizeMode="cover"
                    />
                </View>

                {/* Right Bubble (User) */}
                <View className="self-end bg-[#F3F4F6] rounded-2xl rounded-tr-none p-4 max-w-[80%] mb-4">
                    <Text className="text-gray-700 leading-5">
                        The quick brown fox jumps over the lazy dog
                    </Text>
                </View>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-sm text-gray-500 mb-2">Attachments:</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {attachments.map((attachment, index) => (
                                <View key={index} className="relative">
                                    {attachment.type === 'image' ? (
                                        <Image
                                            source={{ uri: attachment.uri }}
                                            className="w-20 h-20 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center">
                                            <Ionicons name="videocam" size={24} color="#6B7280" />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => removeAttachment(index)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                                    >
                                        <Ionicons name="close" size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
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
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                        <TouchableOpacity className="w-10 h-10 bg-[#FFC107] rounded-full items-center justify-center shadow-sm">
                            <Ionicons name="send" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
