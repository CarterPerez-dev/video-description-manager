import { FlatList, StyleSheet, RefreshControl } from 'react-native'
import type { Platform } from '@/config'
import type { VideoEntry } from '@/api/types'
import { VideoEntryCard } from './VideoEntryCard'

interface Props {
  videos: VideoEntry[]
  platform: Platform
  isLoading: boolean
  onRefresh: () => void
}

export function VideoList({ videos, platform, isLoading, onRefresh }: Props) {
  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <VideoEntryCard video={item} platform={platform} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
  },
})
