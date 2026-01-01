import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  onPress: () => void
}

export function AddButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>+</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
    marginTop: -1,
  },
})
