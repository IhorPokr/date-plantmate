import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../constants/supabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

type SavedIdea = {
  id: string;
  idea: string;
  created_at: string;
};

const SavedIdeaCard = React.memo(({ idea }: { idea: SavedIdea }) => {
  const title = idea.idea.match(/Title:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const description = idea.idea.match(/Description:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const cost = idea.idea.match(/Estimated cost:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const duration = idea.idea.match(/Duration:(.*?)(?=\n|$)/)?.[1].trim() || '';

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>ESTIMATED COST</Text>
          <Text style={styles.detailValue}>{cost}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>DURATION</Text>
          <Text style={styles.detailValue}>{duration}</Text>
        </View>
      </View>
    </View>
  );
});

export default function SavedIdeas() {
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Dates</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FlashList
        data={savedIdeas}
        renderItem={({ item }) => <SavedIdeaCard idea={item} />}
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
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    padding: 20,
    paddingBottom: 0,
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
    backgroundColor: '#2C2C2E',
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
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#FF453A',
    fontSize: 17,
    fontWeight: '600',
  },
}); 