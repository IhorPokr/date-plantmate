import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../constants/supabaseClient';

export default function Index() {
  async function testSupabase() {
    const { data, error } = await supabase.from('date_planmate').select('*');
    if (error) console.error('Error:', error.message);
    else console.log('Data:', data);
  }

  testSupabase();

  return (
    <View style={styles.container}>
      <Text>Supabase connection test running!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
