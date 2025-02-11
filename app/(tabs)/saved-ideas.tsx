import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../constants/supabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { router } from 'expo-router';
import { colors } from '../utils/colors';
import { addToCalendar, setDateReminder, shareDateIdea } from '../utils/dateActions';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateChecklist from '../components/DateChecklist';
import DateMemories from '../components/DateMemories';
import DateRecommendations from '../components/DateRecommendations';

type SavedIdea = {
  id: string;
  idea: string;
  created_at: string;
};

const SavedIdeaCard = React.memo(({ 
  idea, 
  theme,
  isDarkMode, 
  onDelete,
  onPress
}: { 
  idea: SavedIdea; 
  theme: typeof colors.dark;
  isDarkMode: boolean;
  onDelete: (id: string) => void;
  onPress: (idea: SavedIdea) => void;
}) => {
  const title = idea.idea.match(/Title:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const description = idea.idea.match(/Description:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const cost = idea.idea.match(/Estimated cost:(.*?)(?=\n|$)/)?.[1].trim() || '';
  const duration = idea.idea.match(/Duration:(.*?)(?=\n|$)/)?.[1].trim() || '';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const handleAddToCalendar = async () => {
    const durationHours = parseInt(duration) || 2; // Default to 2 hours if parsing fails
    await addToCalendar(title, description, selectedDate, durationHours);
  };

  const handleSetReminder = async () => {
    await setDateReminder(title, description, selectedDate);
  };

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
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => onPress(idea)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
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

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.actionButtonText, { color: theme.text }]}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => shareDateIdea(title, description, cost, duration)}
        >
          <Text style={[styles.actionButtonText, { color: theme.text }]}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Text style={[styles.actionButtonText, { color: theme.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
      >
        <View style={styles.datePickerModalOverlay}>
          <View style={[styles.datePickerModalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.datePickerTitle, { color: theme.text }]}>
              Select Date & Time
            </Text>
            
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                onChange={(event, date) => date && setSelectedDate(date)}
                textColor={theme.text}
                themeVariant={isDarkMode ? 'dark' : 'light'}
                display="spinner"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleAddToCalendar}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                  Add to Calendar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleSetReminder}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                  Set Reminder
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.closeButton, { borderTopColor: theme.border }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
});

const DateDetailsModal = ({ idea, onClose, theme }: { 
  idea: SavedIdea; 
  onClose: () => void;
  theme: typeof colors.dark;
}) => {
  const getDateTitle = (ideaText: string) => {
    return ideaText.match(/Title:(.*?)(?=\n|$)/)?.[1].trim() || '';
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{getDateTitle(idea.idea)}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <DateRecommendations 
            theme={theme}
            dateIdea={idea.idea}
          />
          <DateChecklist theme={theme} dateId={idea.id} />
          <DateMemories 
            dateId={idea.id}
            theme={theme}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function SavedIdeas() {
  const { isDarkMode } = useTheme();
  const theme = colors[isDarkMode ? 'dark' : 'light'];
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<SavedIdea | null>(null);

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
            isDarkMode={isDarkMode}
            onDelete={handleDelete}
            onPress={(idea) => setSelectedDate(idea)}
          />
        )}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContainer}
      />
      {selectedDate && (
        <DateDetailsModal 
          idea={selectedDate}
          theme={theme}
          onClose={() => setSelectedDate(null)}
        />
      )}
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  datePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingTop: 16,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 