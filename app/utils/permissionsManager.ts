import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export async function requestRequiredPermissions() {
  const permissions = [
    requestCalendarPermission(),
    requestNotificationPermission(),
    requestLocationPermission(),
    requestCameraPermission(),
    requestPhotoLibraryPermission()
  ];

  try {
    await Promise.all(permissions);
  } catch (error) {
    console.error('Error requesting permissions:', error);
  }
}

export async function requestCalendarPermission() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Calendar access is needed to add date events. You can enable it in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => openSettings() }
      ]
    );
  }
  return status === 'granted';
}

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true
    },
  });
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Notifications are needed for date reminders. You can enable them in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => openSettings() }
      ]
    );
  }
  return status === 'granted';
}

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Location access is needed to find nearby date venues. You can enable it in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => openSettings() }
      ]
    );
  }
  return status === 'granted';
}

export async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Camera access is needed to add photos to your date memories. You can enable it in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => openSettings() }
      ]
    );
  }
  return status === 'granted';
}

export async function requestPhotoLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Photo library access is needed to save date photos. You can enable it in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => openSettings() }
      ]
    );
  }
  return status === 'granted';
}

function openSettings() {
  // Add logic to open app settings
  // This will be implemented when we add the settings feature
} 