import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { requestCalendarPermission, requestNotificationPermission, getDefaultCalendar } from './permissions';

export async function addToCalendar(
  title: string,
  description: string,
  startDate: Date,
  duration: number // in hours
) {
  try {
    const hasPermission = await requestCalendarPermission();
    if (!hasPermission) return;

    const defaultCalendar = await getDefaultCalendar();
    if (!defaultCalendar) {
      Alert.alert('Error', 'No writable calendar found');
      return;
    }

    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title,
      notes: description,
      startDate,
      endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -60 }], // 1 hour before
    });

    Alert.alert('Success', 'Date added to calendar!');
    return eventId;
  } catch (error) {
    console.error('Error adding to calendar:', error);
    Alert.alert('Error', 'Failed to add date to calendar');
  }
}

export async function setDateReminder(
  title: string,
  description: string,
  date: Date
) {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // Cancel any existing notifications for this date idea
    await Notifications.getAllScheduledNotificationsAsync().then(notifications => {
      notifications.forEach(notification => {
        if (notification.content.title === `Upcoming Date: ${title}`) {
          Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      });
    });

    // Schedule reminder for 1 hour before
    const reminderTime = new Date(date.getTime() - 60 * 60 * 1000);
    const now = new Date();

    if (reminderTime > now) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Upcoming Date: ${title}`,
          body: description,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { dateId: title },
        },
        trigger: {
          date: reminderTime,
          channelId: 'date-reminders',
        },
      });

      // Schedule the actual date time notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for your date!`,
          body: `${title} is starting now`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { dateId: title },
        },
        trigger: {
          date: date,
          channelId: 'date-reminders',
        },
      });

      Alert.alert('Success', 'Reminders set successfully!');
      return notificationId;
    } else {
      Alert.alert('Invalid Time', 'Please select a future date and time');
    }
  } catch (error) {
    console.error('Error setting reminder:', error);
    Alert.alert('Error', 'Failed to set reminder');
  }
}

export async function shareDateIdea(
  title: string,
  description: string,
  cost: string,
  duration: string
) {
  try {
    const message = `Check out this date idea!\n\n${title}\n\n${description}\n\nEstimated Cost: ${cost}\nDuration: ${duration}`;
    
    await Sharing.shareAsync(message, {
      dialogTitle: 'Share Date Idea',
      mimeType: 'text/plain',
    });
  } catch (error) {
    console.error('Error sharing:', error);
    Alert.alert('Error', 'Failed to share date idea');
  }
} 