import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
}

const GradientButton = ({ 
  title, 
  onPress, 
  className = "", 
  textClassName = "" 
}: GradientButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} className={className}>
      <LinearGradient
        colors={['#FFCD39', '#FFDA6A', '#FFCD39']} // Light yellow to darker yellow
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          borderRadius: 12,
        }}
        className="py-4 px-8 rounded-full items-center justify-center"
      >
        <Text className={`text-black text-lg font-semibold ${textClassName}`}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;
