import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CustomInput from "./CustomInput";
import GoogleLogin from "./GoogleLogin";
import GradientButton from "./GradientButton";

const SignupComponents = () => {
  const [email, setEmail] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log(email);
  };
  return (
    <View className="pt-5 px-5 pb-10 bg-white/90 rounded-t-2xl ">
      <View className="flex-row items-center gap-5 bg-[#FFF3CD] rounded-2xl">
        <TouchableOpacity
          className=" flex-1"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="font-bold text-[#91958E] py-4 text-center">
            Login
          </Text>
        </TouchableOpacity>
        <GradientButton title="Sign Up" className="w-1/2 " />
      </View>

      {/* name input field */}
      <CustomInput
        label="Name"
        className="mt-2"
        placeholder="name@example.com"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />

      {/* email input field */}
      <CustomInput
        label="Email"
        className="mt-2"
        placeholder="name@example.com"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />

      {/* password input field */}
      <CustomInput
        label="Password"
        className="mt-6"
        placeholder="min. 6 characters"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={isShowPassword ? false : true}
        icon={
          <TouchableOpacity onPress={() => setIsShowPassword(!isShowPassword)}>
            {isShowPassword ? (
              <Feather name="eye" size={24} color="black" />
            ) : (
              <Feather name="eye-off" size={24} color="black" />
            )}
          </TouchableOpacity>
        }
      />

      {/* remember me & forgot password */}
      <View className="mt-3 flex-row items-center justify-between">
        {/* remember me */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className="h-6 w-6 border-2 border-black rounded-md flex-row items-center justify-center"
            onPress={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && <Feather name="check" size={18} color="black" />}
          </TouchableOpacity>
          <Text className="ml-2 text-[#1F2A33] font-medium text-sm">
            I agree to our Terms and Conditions and Privacy Policy.
          </Text>
        </View>
      </View>

      <GradientButton title="Sign up" className="mt-7" onPress={handleLogin} />

      {/* devider or */}
      <View className="mt-3.5 flex-row items-center gap-3">
        {/* divider */}
        <View className=" h-px bg-[#EDEDED] mx-2 flex-1" />
        <Text className="text-[#8E8E8E]  text-base">or</Text>
        {/* divider */}
        <View className="flex-1 h-px bg-[#EDEDED] mx-2" />
      </View>

      {/* google login */}
      <GoogleLogin />
    </View>
  );
};

export default SignupComponents;
