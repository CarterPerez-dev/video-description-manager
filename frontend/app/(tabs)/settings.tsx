import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore, useDraftStore } from '@/core/lib'
import { useLogout } from '@/api/hooks'

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user)
  const clearAllDrafts = useDraftStore((s) => s.clearAllDrafts)
  const logout = useLogout()

  const handleLogout = () => {
    Alert.alert('Logout', 'Sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout.mutate(),
      },
    ])
  }

  const handleClearDrafts = () => {
    Alert.alert('Clear Drafts', 'Clear all unsaved changes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: clearAllDrafts,
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.value}>{user?.email ?? '—'}</Text>
          </View>
          {user?.full_name && (
            <View style={styles.row}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.value}>{user.full_name}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.card} onPress={handleClearDrafts}>
          <View style={styles.row}>
            <Ionicons name="trash-outline" size={16} color="#666" />
            <Text style={styles.value}>Clear unsaved drafts</Text>
            <Ionicons name="chevron-forward" size={16} color="#333" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#ff4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#aaa',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
})
