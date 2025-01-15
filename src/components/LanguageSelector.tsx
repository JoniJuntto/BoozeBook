import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_PERSISTENCE_KEY = 'user-language';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fi', name: 'Suomi' },
  { code: 'sv', name: 'Svenska' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const setLanguage = async (langCode: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_PERSISTENCE_KEY, langCode);
      i18n.changeLanguage(langCode);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  return (
    <View className="bg-[#2A2A2E] rounded-lg p-4">
      <Text className="text-white text-lg font-semibold mb-3">
        {t('common.selectLanguage')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-lg ${
              i18n.language === lang.code
                ? 'bg-[#8884d8]'
                : 'bg-[#1D1C21] border border-[#2A2A2E]'
            }`}
          >
            <Text
              className={`${
                i18n.language === lang.code ? 'text-white' : 'text-gray-400'
              }`}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
} 