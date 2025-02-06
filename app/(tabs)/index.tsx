import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase, getCompleteSession } from '../../constants/supabaseClient';

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        router.replace('/(auth)/login');
        return;
      }
      
      if (!session) {
        router.replace('/(auth)/login');
        return;
      }
      
      const completeSession = await getCompleteSession();
      console.log('Complete session:', completeSession);
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      router.replace('/(auth)/login');
    }
  }

  const handleGetDateIdea = () => {
    // TODO: Implement date idea generation
    console.log('Getting a date idea...');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleGetDateIdea}
      >
        <Text style={styles.buttonText}>Get a Date Idea</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
