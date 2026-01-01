/**
 * AngelaMos | 2025
 * useVideos.ts
 */

import { Alert } from 'react-native'
import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  VIDEO_ERROR_MESSAGES,
  VIDEO_SUCCESS_MESSAGES,
  VideoResponseError,
  isValidVideoEntry,
  isValidVideoListResponse,
  type VideoEntry,
  type VideoCreateRequest,
  type VideoUpdateRequest,
  type VideoCopyRequest,
  type VideoListResponse,
} from '@/api/types'
import { API_ENDPOINTS, QUERY_KEYS, type Platform } from '@/config'
import { apiClient, QUERY_STRATEGIES } from '@/core/api'

export const videoQueries = {
  all: () => QUERY_KEYS.VIDEOS.ALL,
  list: (platform?: Platform) => QUERY_KEYS.VIDEOS.LIST(platform),
  byId: (id: string) => QUERY_KEYS.VIDEOS.BY_ID(id),
} as const

const fetchVideos = async (platform?: Platform): Promise<VideoEntry[]> => {
  const params = platform ? { platform } : {}
  const response = await apiClient.get<unknown>(API_ENDPOINTS.VIDEOS.BASE, { params })
  const data: unknown = response.data

  if (!isValidVideoListResponse(data)) {
    throw new VideoResponseError(
      VIDEO_ERROR_MESSAGES.INVALID_VIDEO_LIST_RESPONSE,
      API_ENDPOINTS.VIDEOS.BASE
    )
  }

  return data.items
}

export const useVideos = (
  platform?: Platform
): UseQueryResult<VideoEntry[], Error> => {
  return useQuery({
    queryKey: videoQueries.list(platform),
    queryFn: () => fetchVideos(platform),
    ...QUERY_STRATEGIES.standard,
  })
}

const fetchVideo = async (id: string): Promise<VideoEntry> => {
  const response = await apiClient.get<unknown>(API_ENDPOINTS.VIDEOS.BY_ID(id))
  const data: unknown = response.data

  if (!isValidVideoEntry(data)) {
    throw new VideoResponseError(
      VIDEO_ERROR_MESSAGES.INVALID_VIDEO_RESPONSE,
      API_ENDPOINTS.VIDEOS.BY_ID(id)
    )
  }

  return data
}

export const useVideo = (id: string): UseQueryResult<VideoEntry, Error> => {
  return useQuery({
    queryKey: videoQueries.byId(id),
    queryFn: () => fetchVideo(id),
    enabled: !!id,
    ...QUERY_STRATEGIES.standard,
  })
}

const performCreateVideo = async (data: VideoCreateRequest): Promise<VideoEntry> => {
  const response = await apiClient.post<unknown>(API_ENDPOINTS.VIDEOS.BASE, data)
  const responseData: unknown = response.data

  if (!isValidVideoEntry(responseData)) {
    throw new VideoResponseError(
      VIDEO_ERROR_MESSAGES.INVALID_VIDEO_RESPONSE,
      API_ENDPOINTS.VIDEOS.BASE
    )
  }

  return responseData
}

export const useCreateVideo = (): UseMutationResult<
  VideoEntry,
  Error,
  VideoCreateRequest
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performCreateVideo,
    onSuccess: (data): void => {
      queryClient.invalidateQueries({ queryKey: videoQueries.list(data.platform) })
    },
    onError: (error: Error): void => {
      const message =
        error instanceof VideoResponseError
          ? error.message
          : VIDEO_ERROR_MESSAGES.FAILED_TO_CREATE
      Alert.alert('Error', message)
    },
  })
}

interface UpdateVideoParams {
  id: string
  data: VideoUpdateRequest
}

const performUpdateVideo = async ({
  id,
  data,
}: UpdateVideoParams): Promise<VideoEntry> => {
  const response = await apiClient.patch<unknown>(API_ENDPOINTS.VIDEOS.BY_ID(id), data)
  const responseData: unknown = response.data

  if (!isValidVideoEntry(responseData)) {
    throw new VideoResponseError(
      VIDEO_ERROR_MESSAGES.INVALID_VIDEO_RESPONSE,
      API_ENDPOINTS.VIDEOS.BY_ID(id)
    )
  }

  return responseData
}

export const useUpdateVideo = (): UseMutationResult<
  VideoEntry,
  Error,
  UpdateVideoParams
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performUpdateVideo,
    onSuccess: (data): void => {
      queryClient.invalidateQueries({ queryKey: videoQueries.list(data.platform) })
      queryClient.invalidateQueries({ queryKey: videoQueries.byId(data.id) })
    },
    onError: (error: Error): void => {
      const message =
        error instanceof VideoResponseError
          ? error.message
          : VIDEO_ERROR_MESSAGES.FAILED_TO_UPDATE
      Alert.alert('Error', message)
    },
  })
}

const performDeleteVideo = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.VIDEOS.BY_ID(id))
}

export const useDeleteVideo = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performDeleteVideo,
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: videoQueries.all() })
    },
    onError: (error: Error): void => {
      const message =
        error instanceof VideoResponseError
          ? error.message
          : VIDEO_ERROR_MESSAGES.FAILED_TO_DELETE
      Alert.alert('Error', message)
    },
  })
}

interface CopyVideoParams {
  id: string
  data: VideoCopyRequest
}

const performCopyVideo = async ({
  id,
  data,
}: CopyVideoParams): Promise<VideoEntry> => {
  const response = await apiClient.post<unknown>(API_ENDPOINTS.VIDEOS.COPY(id), data)
  const responseData: unknown = response.data

  if (!isValidVideoEntry(responseData)) {
    throw new VideoResponseError(
      VIDEO_ERROR_MESSAGES.INVALID_VIDEO_RESPONSE,
      API_ENDPOINTS.VIDEOS.COPY(id)
    )
  }

  return responseData
}

export const useCopyVideo = (): UseMutationResult<
  VideoEntry,
  Error,
  CopyVideoParams
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: performCopyVideo,
    onSuccess: (data): void => {
      queryClient.invalidateQueries({ queryKey: videoQueries.list(data.platform) })
    },
    onError: (error: Error): void => {
      const message =
        error instanceof VideoResponseError
          ? error.message
          : VIDEO_ERROR_MESSAGES.FAILED_TO_COPY
      Alert.alert('Error', message)
    },
  })
}
