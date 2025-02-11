import * as Notifications from 'expo-notifications';

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Configure how notifications are presented when the app is in the foreground
  Notifications.setNotificationChannelAsync('date-reminders', {
    name: 'Date Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    enableVibrate: true,
  });
} 