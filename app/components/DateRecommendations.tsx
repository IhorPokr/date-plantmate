import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DateRecommendations({ 
  theme,
  dateIdea
}: { 
  theme: typeof colors.dark;
  dateIdea: string;
}) {
  const getTips = (idea: string) => {
    const lowerIdea = idea.toLowerCase();
    if (lowerIdea.includes('outdoor') || lowerIdea.includes('park') || lowerIdea.includes('picnic')) {
      return [
        'Check the weather forecast',
        'Bring a blanket or portable chairs',
        'Pack some snacks and drinks',
        'Consider bringing outdoor games'
      ];
    }
    if (lowerIdea.includes('restaurant') || lowerIdea.includes('dining')) {
      return [
        'Make a reservation in advance',
        'Check the dress code',
        'Look up the menu beforehand',
        'Consider dietary restrictions'
      ];
    }
    if (lowerIdea.includes('movie') || lowerIdea.includes('theater')) {
      return [
        'Book tickets in advance',
        'Arrive early for good seats',
        'Check movie reviews',
        'Plan dinner before/after'
      ];
    }
    // Default tips
    return [
      'Plan your transportation',
      'Set a budget',
      'Have a backup plan',
      'Communicate expectations'
    ];
  };

  const tips = getTips(dateIdea);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Date Tips</Text>
      <View style={[styles.tipsContainer, { backgroundColor: theme.card }]}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={24}
              color={theme.primary}
            />
            <Text style={[styles.tipText, { color: theme.text }]}>
              {tip}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  tipsContainer: {
    padding: 16,
    borderRadius: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    marginLeft: 12,
  }
}); 