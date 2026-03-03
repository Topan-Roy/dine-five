import { useStore } from "@/stores/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export const Toast = () => {
    const { toast, hideToast, setToast } = useStore() as any;
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handlePress = () => {
        if (toast.type === "success" || toast.message?.toLowerCase().includes("cart")) {
            router.push("/card");
            hideToast();
        }
    };

    // Animation state
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const progressWidth = useSharedValue(100);
    const translateX = useSharedValue(0);

    const onHide = () => {
        hideToast();
    };

    useEffect(() => {
        if (toast.visible) {
            // Entrance
            translateY.value = withSpring(insets.top + 10, { damping: 15, stiffness: 120 });
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { damping: 12, stiffness: 100 });

            // Progress bar animation
            progressWidth.value = 100;
            progressWidth.value = withTiming(0, { duration: 3000 });
        } else {
            // Exit
            translateY.value = withTiming(-100, { duration: 400 });
            opacity.value = withTiming(0, { duration: 300 });
            scale.value = withTiming(0.9, { duration: 300 });
            translateX.value = withSpring(0);
        }
    }, [toast.visible, insets.top]);

    // Modern Gesture Handler API
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            if (Math.abs(event.velocityX) > 500 || Math.abs(event.translationX) > width * 0.3) {
                translateX.value = withSpring(event.translationX > 0 ? width : -width, { velocity: event.velocityX });
                runOnJS(onHide)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
        backgroundColor: toast.type === 'error' ? 'rgba(255,255,255,0.4)' : '#FFC107',
    }));

    if (!toast.message && !toast.visible) return null;

    const getColors = () => {
        switch (toast.type) {
            case "success":
                return { bg: "#FFFFFF", icon: "#FFC107", text: "#1F2A33", border: "#FFC107" };
            case "error":
                return { bg: "#FFFFFF", icon: "#EF4444", text: "#1F2A33", border: "#EF4444" };
            case "info":
                return { bg: "#FFFFFF", icon: "#3B82F6", text: "#1F2A33", border: "#3B82F6" };
            default:
                return { bg: "#FFFFFF", icon: "#FFC107", text: "#1F2A33", border: "#FFC107" };
        }
    };

    const colors = getColors();

    const getIconName = () => {
        switch (toast.type) {
            case "success": return "checkmark-circle-sharp";
            case "error": return "alert-circle-sharp";
            default: return "information-circle-sharp";
        }
    };

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    styles.container,
                    animatedStyle,
                    { backgroundColor: colors.bg, borderLeftColor: colors.border, borderLeftWidth: 5 },
                ]}
            >
                <TouchableOpacity activeOpacity={0.9} onPress={handlePress} className="flex-row items-center px-4 pt-3.5 pb-4">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${colors.icon}15` }}
                    >
                        <Ionicons name={getIconName() as any} size={24} color={colors.icon} />
                    </View>

                    <View className="flex-1">
                        <Text style={{ color: colors.text }} className="font-bold text-base" numberOfLines={1}>
                            {toast.type === 'success' ? 'Perfect!' : toast.type === 'error' ? 'Oops!' : 'Note'}
                        </Text>
                        <Text className="text-gray-500 text-sm leading-tight" numberOfLines={2}>
                            {toast.message}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={onHide}
                        className="ml-2 w-8 h-8 items-center justify-center rounded-full"
                    >
                        <Ionicons name="close" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Dynamic Progress Bar */}
                <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: colors.icon }]} />
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 15,
    },
    progressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 3,
        opacity: 0.8,
    }
});
