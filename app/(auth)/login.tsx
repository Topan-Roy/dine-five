import LoginComponents from "@/components/LoginComponents";
import { Image, ImageBackground } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

const Login = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      className="flex-1"
    >
      <View className="flex-1">
        <StatusBar style="auto" />
        <ImageBackground
          source={require("@/assets/images/Screenshot.png")}
          resizeMode="cover"
          style={{ flex: 1, width: "100%", height: "100%" }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 items-center justify-center">
              <Image
                source={require("@/assets/images/logo.jpg")}
                contentFit="contain"
                style={{
                  height: 200,
                  width: 200,
                  paddingBottom: 5,
                }}
              />
            </View>
            {/* Login form */}
            <LoginComponents />
          </ScrollView>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
