import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useLogin, useRegister } from '@/api/hooks'

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const login = useLogin()
  const register = useRegister()

  const handleSubmit = async () => {
    if (!email || !password) return

    try {
      if (isRegister) {
        await register.mutateAsync({
          email,
          password,
          full_name: fullName || undefined,
        })
        await login.mutateAsync({ username: email, password })
      } else {
        await login.mutateAsync({ username: email, password })
      }
      router.replace('/(tabs)')
    } catch {}
  }

  const isLoading = login.isPending || register.isPending

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        <Text style={styles.title}>
          {isRegister ? 'Create Account' : 'Sign In'}
        </Text>

        {isRegister && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#444"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#444"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#444"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '...' : isRegister ? 'Register' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsRegister(!isRegister)}
        >
          <Text style={styles.switchText}>
            {isRegister ? 'Have an account? Sign in' : 'Need an account? Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#222',
  },
  button: {
    backgroundColor: '#1a6b1a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  switchText: {
    color: '#555',
    fontSize: 13,
  },
})
