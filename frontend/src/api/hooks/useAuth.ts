/**
 * AngelaMos | 2025
 * useAuth.ts
 */

import { Alert } from 'react-native'
import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  AuthResponseError,
  isValidLogoutAllResponse,
  isValidTokenResponse,
  isValidTokenWithUserResponse,
  isValidUserResponse,
  type LoginRequest,
  type LogoutAllResponse,
  type PasswordChangeRequest,
  type RegisterRequest,
  type TokenWithUserResponse,
  type UserResponse,
} from '@/api/types'
import { API_ENDPOINTS, QUERY_KEYS } from '@/config'
import { apiClient, QUERY_STRATEGIES } from '@/core/api'
import { useAuthStore } from '@/core/lib'

export const authQueries = {
  all: () => QUERY_KEYS.AUTH.ALL,
  me: () => QUERY_KEYS.AUTH.ME(),
} as const

const fetchCurrentUser = async (): Promise<UserResponse> => {
  const response = await apiClient.get<unknown>(API_ENDPOINTS.AUTH.ME)
  const data: unknown = response.data

  if (!isValidUserResponse(data)) {
    throw new AuthResponseError(
      AUTH_ERROR_MESSAGES.INVALID_USER_RESPONSE,
      API_ENDPOINTS.AUTH.ME
    )
  }

  return data
}

export const useCurrentUser = (): UseQueryResult<UserResponse, Error> => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: authQueries.me(),
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    ...QUERY_STRATEGIES.auth,
  })
}

const performLogin = async (
  credentials: LoginRequest
): Promise<TokenWithUserResponse> => {
  const formData = new URLSearchParams()
  formData.append('username', credentials.username)
  formData.append('password', credentials.password)

  const response = await apiClient.post<unknown>(
    API_ENDPOINTS.AUTH.LOGIN,
    formData,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  )

  const data: unknown = response.data

  if (!isValidTokenWithUserResponse(data)) {
    throw new AuthResponseError(
      AUTH_ERROR_MESSAGES.INVALID_LOGIN_RESPONSE,
      API_ENDPOINTS.AUTH.LOGIN
    )
  }

  return data
}

export const useLogin = (): UseMutationResult<
  TokenWithUserResponse,
  Error,
  LoginRequest
> => {
  const queryClient = useQueryClient()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: performLogin,
    onSuccess: (data: TokenWithUserResponse): void => {
      login(data.user, data.access_token)
      queryClient.setQueryData(authQueries.me(), data.user)

      const welcomeMessage = AUTH_SUCCESS_MESSAGES.WELCOME_BACK(
        data.user.full_name
      )
      Alert.alert('Success', welcomeMessage)
    },
    onError: (error: Error): void => {
      const message =
        error instanceof AuthResponseError ? error.message : 'Login failed'
      Alert.alert('Error', message)
    },
  })
}

const performRegister = async (data: RegisterRequest): Promise<UserResponse> => {
  const response = await apiClient.post<unknown>(API_ENDPOINTS.USERS.REGISTER, data)
  const responseData: unknown = response.data

  if (!isValidUserResponse(responseData)) {
    throw new AuthResponseError(
      AUTH_ERROR_MESSAGES.INVALID_USER_RESPONSE,
      API_ENDPOINTS.USERS.REGISTER
    )
  }

  return responseData
}

export const useRegister = (): UseMutationResult<
  UserResponse,
  Error,
  RegisterRequest
> => {
  return useMutation({
    mutationFn: performRegister,
    onSuccess: (): void => {
      Alert.alert('Success', AUTH_SUCCESS_MESSAGES.REGISTERED)
    },
    onError: (error: Error): void => {
      const message =
        error instanceof AuthResponseError ? error.message : 'Registration failed'
      Alert.alert('Error', message)
    },
  })
}

const performLogout = async (): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
}

export const useLogout = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: performLogout,
    onSuccess: (): void => {
      logout()
      queryClient.removeQueries({ queryKey: authQueries.all() })
      Alert.alert('Success', AUTH_SUCCESS_MESSAGES.LOGOUT_SUCCESS)
      router.replace('/login')
    },
    onError: (): void => {
      logout()
      queryClient.removeQueries({ queryKey: authQueries.all() })
      router.replace('/login')
    },
  })
}

const performLogoutAll = async (): Promise<LogoutAllResponse> => {
  const response = await apiClient.post<unknown>(API_ENDPOINTS.AUTH.LOGOUT_ALL)
  const data: unknown = response.data

  if (!isValidLogoutAllResponse(data)) {
    throw new AuthResponseError(
      AUTH_ERROR_MESSAGES.INVALID_LOGOUT_RESPONSE,
      API_ENDPOINTS.AUTH.LOGOUT_ALL
    )
  }

  return data
}

export const useLogoutAll = (): UseMutationResult<
  LogoutAllResponse,
  Error,
  void
> => {
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: performLogoutAll,
    onSuccess: (data: LogoutAllResponse): void => {
      logout()
      queryClient.removeQueries({ queryKey: authQueries.all() })
      Alert.alert('Success', `Logged out from ${data.revoked_sessions} session(s)`)
      router.replace('/login')
    },
    onError: (error: Error): void => {
      const message =
        error instanceof AuthResponseError
          ? error.message
          : 'Failed to logout all sessions'
      Alert.alert('Error', message)
    },
  })
}

const performPasswordChange = async (
  data: PasswordChangeRequest
): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
}

export const useChangePassword = (): UseMutationResult<
  void,
  Error,
  PasswordChangeRequest
> => {
  return useMutation({
    mutationFn: performPasswordChange,
    onSuccess: (): void => {
      Alert.alert('Success', AUTH_SUCCESS_MESSAGES.PASSWORD_CHANGED)
    },
    onError: (error: Error): void => {
      const message =
        error instanceof AuthResponseError
          ? error.message
          : 'Failed to change password'
      Alert.alert('Error', message)
    },
  })
}

export const useRefreshAuth = (): (() => Promise<void>) => {
  const queryClient = useQueryClient()
  const { setAccessToken, login, logout } = useAuthStore()

  return async (): Promise<void> => {
    try {
      const response = await apiClient.post<unknown>(API_ENDPOINTS.AUTH.REFRESH)
      const data: unknown = response.data

      if (!isValidTokenResponse(data)) {
        throw new AuthResponseError(
          AUTH_ERROR_MESSAGES.INVALID_TOKEN_RESPONSE,
          API_ENDPOINTS.AUTH.REFRESH
        )
      }

      setAccessToken(data.access_token)

      const userResponse = await apiClient.get<unknown>(API_ENDPOINTS.AUTH.ME)
      const userData: unknown = userResponse.data

      if (isValidUserResponse(userData)) {
        login(userData, data.access_token)
        queryClient.setQueryData(authQueries.me(), userData)
      }
    } catch {
      logout()
      queryClient.removeQueries({ queryKey: authQueries.all() })
    }
  }
}
