import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CartItemProps {
    id: number | string;
    name: string;
    price: string;
    image: string;
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onRemove?: () => void; // Optional remove (trash icon)
}

export const CartItem = ({
    name,
    price,
    image,
    quantity,
    onIncrement,
    onDecrement
}: CartItemProps) => {
    return (
        <View className="flex-row items-center bg-white p-3 rounded-2xl mb-4 shadow-sm border border-gray-100">
            <Image
                source={{ uri: image }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
            />

            <View className="flex-1 ml-3">
                <Text className="text-lg font-bold text-gray-900 mb-1">{name}</Text>
                <Text className="text-lg font-bold text-gray-900 mb-2">${price}</Text>

                <View className="flex-row justify-end">
                    <View className="flex-row items-center bg-[#FFF9E6] rounded-full px-2 py-1 gap-4">
                        <TouchableOpacity
                            onPress={onDecrement}
                            className="w-6 h-6 items-center justify-center bg-[#FFE69C] rounded-full">
                            {/* If quantity is 1, maybe show trash bin? The design shows trash bin icon when quantity is 1, else minus? 
                        The image 1 shows trash bin icon for quantity 1 item. 
                        Image 2 shows minus icon. 
                        I'll use a simple logic: if qty > 1 show minus, else show trash?
                        But the prop is onDecrement. 
                        Actually looking close at Image 1: 'Cheese Burst Pizza' has 'trash' icon and quantity '1'.
                        Image 3 (Confirm Order) shows 'trash' icon for qty 1, and 'minus' for qty 1 (middle item)? No that middle item has minus. 
                        Wait, let's just use a trash icon if standard decrement isn't desired, but usually standard is minus.
                        However, the icons in the image are distinct:
                        - Trash can icon (black outline) in a yellow circle? No, transparency? 
                        - Plus icon.
                        I will just use - and + for simplicity unless I see a clear trash requirement.
                        Ah, look at the first screen in image: Top item has trash bin. Middle item has trash bin. Bottom item has minus.
                        It seems inconsistent or depends on "Delete" action vs "Decrease".
                        I'll stick to a generic logic: if q=1 -> Trash icon? Or just rely on generic - icon.
                        Let's use Trash for Q=1 for better UX.
                    */}
                            <Ionicons name={quantity === 1 ? "trash-outline" : "remove"} size={14} color="#332701" />
                        </TouchableOpacity>
                        <Text className="text-base font-bold text-gray-900">{quantity}</Text>
                        <TouchableOpacity
                            onPress={onIncrement}
                            className="w-6 h-6 items-center justify-center bg-[#FFE69C] rounded-full">
                            <Ionicons name="add" size={14} color="#332701" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
