import { View, Text, StyleSheet } from 'react-native'

interface Props {
  platform: string
}

export function EmptyState({ platform }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No videos yet</Text>
      <Text style={styles.subtitle}>
        Tap + to add your first {platform} video
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
})
