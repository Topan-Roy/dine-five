import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCard, setSelectedCard] = useState('Mastercard - Daniel Jones');

    const CARDS = [
        'Mastercard - Daniel Jones',
        'Mastercard - Emily Jones'
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center justify-center pt-2 pb-6 relative px-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Checkout</Text>
            </View>

            <ScrollView className="flex-1 px-6">

                {/* Pickup Address */}
                <View className="mb-6">
                    <View className="flex-row items-start">
                        <Ionicons name="card-outline" size={24} color="#666" style={{ marginTop: 2, marginRight: 12 }} />
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs mb-1">Pickup from</Text>
                            <Text className="text-gray-900 font-bold text-base">king kong - 123 Main St, Apt 4B</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="mb-8">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-start">
                            <Ionicons name="card-outline" size={24} color="#666" style={{ marginTop: 2, marginRight: 12 }} />
                            <View>
                                <Text className="text-gray-500 text-xs mb-1">Payment from</Text>
                                <Text className="text-gray-900 font-bold text-base">{selectedCard}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                </TouchableOpacity>

                {/* Summary */}
                <View className="mt-4 pt-6 border-t border-gray-100">
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500 text-base">Subtotal</Text>
                        <Text className="text-gray-900 font-bold text-base">56.27</Text>
                    </View>
                    <View className="flex-row justify-between text-lg">
                        <Text className="text-gray-500 text-base">Total</Text>
                        <Text className="text-gray-900 font-bold text-base">60.26</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View className="absolute bottom-16 left-0 right-0 bg-[#FDFBF7] px-4 py-6 border-t border-gray-100 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">$29.95</Text>
                <TouchableOpacity
                    onPress={() => router.push('/screens/card/order-success')}
                    className="bg-yellow-400 px-10 py-4 rounded-2xl shadow-md">
                    <Text className="text-gray-900 font-bold text-lg">Place order</Text>
                </TouchableOpacity>
            </View>

            {/* Change Card Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 min-h-[40%]">
                        <View className="items-center mb-6">
                            <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
                            <Text className="text-lg font-bold text-gray-900">Change card</Text>
                        </View>

                        {CARDS.map((card, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedCard(card)}
                                className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-3">
                                <Text className="text-gray-900 font-medium">{card}</Text>
                                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedCard === card ? 'border-[#FFC107]' : 'border-gray-300'}`}>
                                    {selectedCard === card && <View className="w-2.5 h-2.5 rounded-full bg-[#FFC107]" />}
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="bg-yellow-400 w-full py-4 rounded-2xl shadow-md mt-6 items-center">
                            <Text className="text-gray-900 font-bold text-lg">Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
