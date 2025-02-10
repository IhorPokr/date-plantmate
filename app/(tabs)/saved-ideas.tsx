import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../constants/supabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { router } from 'expo-router';
import { colors } from '../utils/colors';

type SavedIdea = {
  id: string;
  idea: string;
  created_at: string;
};

const SavedIdeaCard = React.memo(({ 
  idea, 
  theme, 
  onDelete 
}: { 
  idea: SavedIdea; 
  theme: typeof colors.dark;
  onDelete: (id: string) => void;
}) => {
  const title = idea.idea.match(/Title:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const description = idea.idea.match(/Description:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const cost = idea.idea.match(/Estimated cost:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const duration = idea.idea.match(/Duration:(.*?)(?=\n|$)/)?.[1].trim() || '';

  const handleDelete = () => {
    Alert.alert(
      'Delete Date Idea',
      'Are you sure you want to delete this date idea?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(idea.id)
        }
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
        <TouchableOpacity 
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Text style={[styles.deleteButtonText, { color: theme.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.description, { color: theme.text }]}>{description}</Text>
      
      <View style={[styles.detailsContainer, { backgroundColor: theme.border }]}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>ESTIMATED COST</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{cost}</Text>
        </View>
        <View style={[styles.detailDivider, { backgroundColor: theme.border }]} />
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>DURATION</Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>{duration}</Text>
        </View>
      </View>
    </View>
  );
});

export default function SavedIdeas() {
  const { isDarkMode } = useTheme();
  const theme = colors[isDarkMode ? 'dark' : 'light'];
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSavedIdeas();
    }, [])
  );

  async function loadSavedIdeas() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Loading saved ideas for user:', session?.user.id);
      
      const { data, error } = await supabase
        .from('ai_generated_ideas')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('saved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Loaded saved ideas:', data);
      setSavedIdeas(data);
    } catch (error) {
      console.error('Error loading saved ideas:', error);
      Alert.alert('Error', 'Failed to load saved ideas');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (ideaId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('ai_generated_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      // Update the local state to remove the deleted idea
      setSavedIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    } catch (error) {
      console.error('Error deleting idea:', error);
      Alert.alert('Error', 'Failed to delete the date idea');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading saved dates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Saved Dates</Text>
      </View>
      <FlashList
        data={savedIdeas}
        renderItem={({ item }) => (
          <SavedIdeaCard 
            idea={item} 
            theme={theme}
            onDelete={handleDelete}
          />
        )}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.35,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
    color: '#FFF',
    padding: 20,
    opacity: 0.9,
  },
  detailsContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#3C3C3E',
    marginHorizontal: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 17,
    color: '#FFF',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 17,
    marginTop: 12,
  },
}); 