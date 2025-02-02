import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signUp, login, logout } from '../utils/auth'; // Adjust path if needed
import { supabase } from '../constants/supabaseClient';


async function checkSession() {
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error.message);
  } else if (sessionData.session) {
    console.log('Current Session User:', sessionData.session.user); // Logs the current user
  } else {
    console.log('No active session'); // Logs if the user is logged out
  }
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text>Auth Test</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={() => signUp(email, password)} />
      <Button title="Login" onPress={() => login(email, password)} />
      <Button title="Logout" onPress={logout} />
      <Button title="Check Session" onPress={checkSession} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, width: '100%' },
});
