import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
          height: 80,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 16, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TikTok',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="instagram"
        options={{
          title: 'Instagram',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="youtube"
        options={{
          title: 'YouTube',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
