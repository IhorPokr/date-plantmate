import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sign Up Screen</Text>
      <Link href="/(auth)/login">Back to Login</Link>
    </View>
  );
} 