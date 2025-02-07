import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 60,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#000',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={30}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null
        ),
        tabBarActiveTintColor: '#0a84ff',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={{ 
              backgroundColor: color === '#0a84ff' ? '#0a84ff20' : 'transparent',
              padding: 8,
              borderRadius: 16,
            }}>
              <TabBarIcon name="house.fill" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved-ideas"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <View style={{ 
              backgroundColor: color === '#0a84ff' ? '#0a84ff20' : 'transparent',
              padding: 8,
              borderRadius: 16,
            }}>
              <TabBarIcon name="heart.fill" color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof IconSymbol>['name'];
  color: string;
  size: number;
}) {
  const { size, ...otherProps } = props;
  return (
    <IconSymbol
      size={size - 3}
      style={{ marginBottom: -3 }}
      {...otherProps}
    />
  );
}
