import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../constants/supabaseClient';
import { colors } from '../utils/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function DateMemories({ dateId, theme }: { dateId: string; theme: typeof colors.dark }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Load existing memories
  useEffect(() => {
    async function loadMemories() {
      const { data, error } = await supabase
        .from('date_memories')
        .select('*')
        .eq('date_idea_id', dateId)
        .single();

      if (data) {
        setPhotos(data.photos || []);
        setRating(data.rating || 0);
        setReview(data.review || '');
      }
    }
    loadMemories();
  }, [dateId]);

  // Save memories when updated
  const saveMemories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No user session found');
        return;
      }

      const { error } = await supabase
        .from('date_memories')
        .upsert({
          date_idea_id: parseInt(dateId), // Convert to number since we're using bigint in DB
          user_id: session.user.id,
          photos,
          rating,
          review
        }, {
          onConflict: 'date_idea_id,user_id'
        });

      if (error) {
        console.error('Error saving memories:', error);
        Alert.alert('Error', 'Failed to save memories');
      }
    } catch (error) {
      console.error('Error in saveMemories:', error);
    }
  };

  // Call saveMemories when photos, rating, or review changes
  useEffect(() => {
    saveMemories();
  }, [photos, rating, review]);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop()!;
        const response = await fetch(uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
          .from('date-memories')
          .upload(`${dateId}/${filename}`, blob);

        if (error) throw error;

        setPhotos([...photos, data.path]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        for (const asset of result.assets) {
          const uri = asset.uri;
          const filename = uri.split('/').pop()!;
          const response = await fetch(uri);
          const blob = await response.blob();

          const { data, error } = await supabase.storage
            .from('date-memories')
            .upload(`${dateId}/${filename}`, blob);

          if (error) throw error;
          setPhotos(prev => [...prev, data.path]);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const Rating = ({ rating, onRatingChange, theme }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    theme: typeof colors.dark;
  }) => {
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => onRatingChange(star)}
              style={styles.starButton}
            >
              <MaterialCommunityIcons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? theme.primary : theme.secondaryText}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Date Memories</Text>
      
      <View style={styles.photoButtons}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <Image 
            key={index}
            source={{ uri: supabase.storage.from('date-memories').getPublicUrl(photo).data.publicUrl }}
            style={styles.photo}
          />
        ))}
      </View>

      <View style={styles.ratingContainer}>
        <Text style={[styles.subtitle, { color: theme.text }]}>Rate your experience</Text>
        <Rating
          rating={rating}
          onRatingChange={setRating}
          theme={theme}
        />
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
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  ratingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  starButton: {
    padding: 4,
  },
}); 