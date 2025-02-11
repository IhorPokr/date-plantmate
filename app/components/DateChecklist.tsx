import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { ChecklistItem } from '../types/social';
import { supabase } from '../../constants/supabaseClient';

export default function DateChecklist({ dateId, theme }: { dateId: string; theme: typeof colors.dark }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');

  // Load existing checklist
  useEffect(() => {
    async function loadChecklist() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('date_checklists')
          .select('items')
          .eq('date_idea_id', parseInt(dateId))
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error
          console.error('Error loading checklist:', error);
          return;
        }

        if (data?.items) {
          setItems(data.items);
        } else {
          // Set default items if no checklist exists
          setItems([
            { id: '1', text: 'Confirm reservation', isCompleted: false },
            { id: '2', text: 'Check weather', isCompleted: false },
            { id: '3', text: 'Plan outfit', isCompleted: false },
          ]);
        }
      } catch (error) {
        console.error('Error in loadChecklist:', error);
      }
    }

    loadChecklist();
  }, [dateId]);

  // Save checklist when updated
  const saveChecklist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No user session found');
        return;
      }

      const { error } = await supabase
        .from('date_checklists')
        .upsert({
          date_idea_id: parseInt(dateId), // Convert to number since we're using bigint in DB
          user_id: session.user.id,
          items: items
        }, {
          onConflict: 'date_idea_id,user_id'
        });

      if (error) {
        console.error('Error saving checklist:', error);
        Alert.alert('Error', 'Failed to save checklist');
      }
    } catch (error) {
      console.error('Error in saveChecklist:', error);
    }
  };

  // Add debouncing to avoid too frequent saves
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (items.length > 0) {
        saveChecklist();
      }
    }, 500); // Wait 500ms after last change before saving

    return () => clearTimeout(timeoutId);
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, {
        id: Date.now().toString(),
        text: newItem.trim(),
        isCompleted: false
      }]);
      setNewItem('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Date Checklist</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border
          }]}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item"
          placeholderTextColor={theme.secondaryText}
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={addItem}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, { backgroundColor: theme.card }]}
          onPress={() => toggleItem(item.id)}
        >
          <Ionicons
            name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.isCompleted ? theme.primary : theme.secondaryText}
          />
          <Text style={[
            styles.itemText,
            { color: theme.text },
            item.isCompleted && styles.completedText
          ]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
}); 