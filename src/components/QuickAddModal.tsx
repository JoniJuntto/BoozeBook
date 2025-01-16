import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Plus, ChevronDown, Camera } from "lucide-react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { drinkTypes } from "../utils/constants";
import { useTranslation } from "react-i18next";

type QuickAddModalProps = {
  visible: boolean;
  onClose: () => void;
  formData: any;
  handleChange: (name: string, value: string) => void;
  handleSubmit: () => void;
  onScannerRequest: () => void;
};

export default function QuickAddModal({
  visible,
  onClose,
  formData,
  handleChange,
  handleSubmit,
  onScannerRequest,
}: QuickAddModalProps): JSX.Element {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(Platform.OS === 'web' ? true : false);
  const [showExtraFields, setShowExtraFields] = useState(false);

  const resetAndClose = () => {
    setShowForm(false);
    onClose();
  };

  if (!showForm) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutDown.duration(200)}
            className="bg-background rounded-t-3xl"
          >
            <View className="p-4 border-b border-gray-800">
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-white">
                  {t('quickAddModal.addDrink')}
                </Text>
                <TouchableOpacity
                  onPress={resetAndClose}
                  className="p-2 bg-secondary rounded-full"
                >
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-4 space-y-4">
              <TouchableOpacity
                onPress={() => {
                  resetAndClose();
                  onScannerRequest();
                }}
                className="w-full bg-secondary p-4 rounded-xl flex-row items-center space-x-3"
              >
                <Camera size={24} color="white" />
                <View className="ml-4">
                  <Text className="text-white font-semibold text-lg">
                    {t('quickAddModal.scanBarcode')}
                  </Text>
                  <Text className="text-gray-400">
                    {t('quickAddModal.quicklyAddDrinkByScanningBarcode')}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForm(true)}
                className="w-full mt-4 mb-4 bg-secondary p-4 rounded-xl flex-row items-center space-x-3"
              >
                <Plus size={24} color="white" />
                <View className="ml-4">
                  <Text className="text-white font-semibold text-lg">
                    {t('quickAddModal.manualEntry')}
                  </Text>
                  <Text className="text-gray-400">
                    {t('quickAddModal.addDrinkDetailsManually')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(200)}
          className="bg-background rounded-3xl w-full max-w-2xl mx-4"
        >
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
              <Text className="text-2xl font-bold text-white">
                {t('quickAddModal.addDrink')}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-secondary rounded-full"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              {/* Drink Type Selection */}
              <Animated.View
                entering={FadeInUp.delay(100).duration(300)}
                className="mb-6"
              >
                <Text className="text-sm font-medium text-gray-400 mb-3">
                  {t('quickAddModal.whatAreYouDrinking')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {drinkTypes.map(({ value, translationKey, Icon }: any) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => handleChange("type", value)}
                      className={`flex-row items-center space-x-2 py-3 px-4 rounded-xl ${
                        formData.type === value ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      {Icon && <Icon size={18} color="white" />}
                      <Text className="text-white font-medium">{t(translationKey)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              {/* Required Fields */}
              <Animated.View
                entering={FadeInUp.delay(200).duration(300)}
                className="flex-row gap-4 mb-6"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-400 mb-2">
                    {t('quickAddModal.volume')}
                  </Text>
                  <TextInput
                    value={formData.volume_ml}
                    onChangeText={(value) => handleChange("volume_ml", value)}
                    placeholder="330"
                    keyboardType="numeric"
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-white"
                    placeholderTextColor="#666"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-400 mb-2">
                    {t('quickAddModal.alcoholPercentage')}
                  </Text>
                  <TextInput
                    value={formData.alcohol_percentage}
                    onChangeText={(value) =>
                      handleChange("alcohol_percentage", value)
                    }
                    placeholder="5.0"
                    keyboardType="numeric"
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-white"
                    placeholderTextColor="#666"
                  />
                </View>
              </Animated.View>

              {/* Toggle Extra Fields */}
              <TouchableOpacity
                onPress={() => setShowExtraFields(!showExtraFields)}
                className="flex-row items-center justify-between py-3 px-4 bg-secondary rounded-xl mb-6"
              >
                <Text className="text-white font-medium">
                  {t('quickAddModal.additionalDetails')}
                </Text>
                <ChevronDown
                  size={20}
                  color="white"
                  style={{
                    transform: [
                      { rotate: showExtraFields ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>

              {showExtraFields && (
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  className="space-y-4"
                >
                  <View>
                    <Text className="text-sm font-medium text-gray-400 mb-2">
                      {t('quickAddModal.drinkName')}
                    </Text>
                    <TextInput
                      value={formData.name}
                      onChangeText={(value) => handleChange("name", value)}
                      placeholder="e.g. Guinness, Cabernet Sauvignon"
                      className="w-full px-4 py-3 bg-secondary rounded-xl text-white"
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-400 mb-2">
                      {t('quickAddModal.location')}
                    </Text>
                    <TextInput
                      value={formData.location}
                      onChangeText={(value) => handleChange("location", value)}
                      placeholder="Where are you?"
                      className="w-full px-4 py-3 bg-secondary rounded-xl text-white"
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-400 mb-2">
                        {t('quickAddModal.mood')}
                      </Text>
                      <TextInput
                        value={formData.mood}
                        onChangeText={(value) => handleChange("mood", value)}
                        placeholder="How are you feeling?"
                        className="w-full px-4 py-3 bg-secondary rounded-xl text-white"
                        placeholderTextColor="#666"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-400 mb-2">
                        {t('quickAddModal.cost')}
                      </Text>
                      <TextInput
                        value={formData.cost}
                        onChangeText={(value) => handleChange("cost", value)}
                        placeholder="0.00"
                        keyboardType="numeric"
                        className="w-full px-4 py-3 bg-secondary rounded-xl text-white"
                        placeholderTextColor="#666"
                      />
                    </View>
                  </View>
                </Animated.View>
              )}
            </ScrollView>

            {/* Submit Button */}
            <View className="p-4 border-t border-gray-800">
              <TouchableOpacity
                onPress={() => {
                  handleSubmit();
                  onClose();
                }}
                className="w-full bg-primary py-4 rounded-xl flex-row items-center justify-center space-x-2"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold text-lg">
                  {t('quickAddModal.addDrink')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
