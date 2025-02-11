import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export async function requestCalendarPermission() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status === 'granted') {
    return true;
  } else {
    Alert.alert(
      'Permission Required',
      'Calendar access is needed to add date events',
      [{ text: 'OK' }]
    );
    return false;
  }
}

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Notification permission is needed for date reminders',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
}

export async function getDefaultCalendar() {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Calendar access is needed to add date events',
        [{ text: 'OK' }]
      );
      return null;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // First try to find the default calendar
    let defaultCalendar = calendars.find(
      (cal) => cal.isPrimary && cal.allowsModifications
    );

    // If no primary calendar, try to find any writable calendar
    if (!defaultCalendar) {
      defaultCalendar = calendars.find((cal) => cal.allowsModifications);
    }

    // If still no calendar, create one
    if (!defaultCalendar && Platform.OS === 'ios') {
      const newCalendarID = await Calendar.createCalendarAsync({
        title: 'Date Planner',
        color: '#0A84FF',
        entityType: Calendar.EntityTypes.EVENT,
        source: {
          isLocalAccount: true,
          name: 'Date Planner',
          type: Calendar.SourceType.LOCAL
        },
        name: 'Date Planner',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      
      // Fetch the newly created calendar
      const newCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      defaultCalendar = newCalendars.find(cal => cal.id === newCalendarID);
    }

    return defaultCalendar;
  } catch (error) {
    console.error('Error getting calendar:', error);
    Alert.alert('Error', 'Failed to access calendar');
    return null;
  }
} 