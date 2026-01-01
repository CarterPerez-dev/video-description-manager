import { View, StyleSheet, Alert } from 'react-native'
import { useVideos, useCreateVideo } from '@/api/hooks'
import { VideoList, EmptyState, AddButton } from '@/components'

export default function TikTokScreen() {
  const { data: videos = [], isLoading, refetch } = useVideos('tiktok')
  const createVideo = useCreateVideo()

  const handleAddVideo = () => {
    const nextNumber = videos.length > 0
      ? Math.max(...videos.map(v => v.video_number)) + 1
      : 1

    createVideo.mutate(
      {
        platform: 'tiktok',
        video_number: nextNumber,
        description: '',
      },
      {
        onSuccess: () => refetch(),
      }
    )
  }

  return (
    <View style={styles.container}>
      {videos.length === 0 && !isLoading ? (
        <EmptyState platform="TikTok" />
      ) : (
        <VideoList
          videos={videos}
          platform="tiktok"
          isLoading={isLoading}
          onRefresh={refetch}
        />
      )}
      <AddButton onPress={handleAddVideo} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
