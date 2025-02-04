import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text>Dashboard</Text>
    </View>
  );
}
