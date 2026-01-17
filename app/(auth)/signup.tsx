import { AuthButton, GoogleAuth, SignUpFields } from "@/components/LoginComponents";
import React, { useState } from "react";
import { Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Background Image */}
        <ImageBackground
       source={require("@/assets/images/splash-screen.png")}
          resizeMode="cover"
          className="flex-1"
        >
          <View className="flex-1 px-6 pt-12">
            {/* Logo */}
            <View className="items-center mb-8">
              <Image
                source={require("@/assets/images/splash-logo.svg")}
                resizeMode="contain"
                style={{
                  height: 80,
                  width: 80,
                }}
              />
            </View>

            {/* Sign Up Title */}
            <Text className="text-white text-2xl font-bold text-center mb-8">
              Sign Up
            </Text>

            {/* Sign Up Form */}
            <SignUpFields
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              agree={agree}
              setAgree={setAgree}
            />

            {/* Sign Up Button */}
            <AuthButton
              title="Sign Up"
              onPress={() => console.log("Sign Up")}
            />

            {/* Google Sign Up */}
            <GoogleAuth
              title="Sign up with Google"
              onPress={() => console.log("Google Sign Up")}
            />

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-white">Already have an account? </Text>
              <TouchableOpacity>
                <Text className="text-yellow-400 font-medium">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
