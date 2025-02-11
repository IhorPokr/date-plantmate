export default {
  expo: {
    name: 'date-planmate',
    slug: 'date-planmate',
    scheme: 'date-planmate',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    newArchEnabled: true,
    extra: {
      EXPO_PUBLIC_WEATHER_API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY,
    },
    // ... other existing config
  },
}; 