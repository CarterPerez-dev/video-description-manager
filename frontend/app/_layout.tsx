import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/core/api'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  )
}
