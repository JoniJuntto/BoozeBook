import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSuggestionStore } from '../stores/suggestionStore';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['Feature', 'Bug', 'Improvement', 'Other'];

export default function CreateSuggestion() {
  const { t } = useTranslation();
  const { createSuggestion, loading, error } = useSuggestionStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    await createSuggestion(title, content, category);
    if (!error) {
      setTitle('');
      setContent('');
      setCategory(CATEGORIES[0]);
    }
  };

  return (
    <View className="p-4 bg-background/80 rounded-lg ">
      <Text className="text-xl font-bold text-white mb-4">
        {t('suggestions.createNew')}
      </Text>
      <Text className="text-sm text-gray-400 mb-4">
        {t('suggestions.createNewDescription')}
      </Text>

      <TextInput
        className="bg-background p-3 rounded-lg text-white mb-3"
        placeholder={t('suggestions.titlePlaceholder')}
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        className="bg-background p-3 rounded-lg text-white mb-3"
        placeholder={t('suggestions.contentPlaceholder')}
        placeholderTextColor="#666"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      <View className="flex-row flex-wrap mb-4">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`mr-2 mb-2 px-3 py-1 rounded-full ${
              category === cat ? 'bg-primary' : 'bg-background'
            }`}
          >
            <Text className="text-white">{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <Text className="text-red-500 mb-2">{error}</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !title.trim() || !content.trim()}
        className={`p-3 rounded-lg ${
          loading || !title.trim() || !content.trim()
            ? 'bg-gray-600'
            : 'bg-primary'
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold">
            {t('suggestions.submit')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
} 