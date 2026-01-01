import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform as RNPlatform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import type { Platform } from '@/config'
import type { VideoEntry } from '@/api/types'
import { useUpdateVideo, useDeleteVideo, useCopyVideo } from '@/api/hooks'
import { useDraftStore } from '@/core/lib'

interface Props {
  video: VideoEntry
  platform: Platform
}

export function VideoEntryCard({ video, platform }: Props) {
  const draft = useDraftStore((s) => s.getDraft(video.id))
  const updateDraft = useDraftStore((s) => s.updateDraft)
  const clearDraft = useDraftStore((s) => s.clearDraft)

  const [description, setDescription] = useState(
    draft?.description ?? video.description
  )
  const [youtubeDesc, setYoutubeDesc] = useState(
    draft?.youtube_description ?? video.youtube_description ?? ''
  )
  const [scheduledTime, setScheduledTime] = useState<Date | null>(
    video.scheduled_time ? new Date(video.scheduled_time) : null
  )
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateVideo = useUpdateVideo()
  const deleteVideo = useDeleteVideo()
  const copyVideo = useCopyVideo()

  useEffect(() => {
    if (
      description !== video.description ||
      youtubeDesc !== video.youtube_description
    ) {
      updateDraft(video.id, {
        description,
        youtube_description: youtubeDesc,
      })
    }
  }, [description, youtubeDesc])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateVideo.mutateAsync({
        id: video.id,
        data: {
          description,
          youtube_description: youtubeDesc || undefined,
          scheduled_time: scheduledTime?.toISOString(),
        },
      })
      clearDraft(video.id)
    } catch {
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete', 'Delete this video?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteVideo.mutate(video.id),
      },
    ])
  }

  const handleCopy = (target: Platform) => {
    copyVideo.mutate({
      id: video.id,
      data: {
        target_platform: target,
        shorten_for_youtube: target === 'youtube',
      },
    })
  }

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      const newDate = scheduledTime ? new Date(scheduledTime) : new Date()
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setScheduledTime(newDate)
      if (RNPlatform.OS === 'android') {
        setShowTimePicker(true)
      }
    }
  }

  const handleTimeChange = (_: any, time?: Date) => {
    setShowTimePicker(false)
    if (time && scheduledTime) {
      const newDate = new Date(scheduledTime)
      newDate.setHours(time.getHours(), time.getMinutes())
      setScheduledTime(newDate)
    }
  }

  const formatSchedule = () => {
    if (!scheduledTime) return 'Set time'
    return scheduledTime.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>#{video.video_number}</Text>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="time-outline" size={14} color="#888" />
          <Text style={styles.scheduleText}>{formatSchedule()}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Description..."
        placeholderTextColor="#444"
        multiline
      />

      {platform === 'youtube' && (
        <TextInput
          style={[styles.input, styles.youtubeInput]}
          value={youtubeDesc}
          onChangeText={setYoutubeDesc}
          placeholder="Short YT description (optional)"
          placeholderTextColor="#444"
          multiline
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.saveBtn, isSaving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Ionicons
            name={isSaving ? 'hourglass-outline' : 'checkmark'}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>

        {platform === 'tiktok' && (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.copyBtn]}
              onPress={() => handleCopy('instagram')}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.copyBtn]}
              onPress={() => handleCopy('youtube')}
            >
              <Ionicons name="play-circle" size={14} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={14} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={scheduledTime || new Date()}
          mode="date"
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={scheduledTime || new Date()}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: '#888',
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
    padding: 10,
    color: '#fff',
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#222',
  },
  youtubeInput: {
    minHeight: 40,
    borderColor: '#661111',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  saveBtn: {
    backgroundColor: '#1a6b1a',
  },
  copyBtn: {
    backgroundColor: '#333',
  },
  deleteBtn: {
    marginLeft: 'auto',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
})
