const API_BASE = '/api'

interface ApiError {
  error: string
  code: string
  details?: unknown
}

class ApiClientError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
  }
}

let isRefreshing = false

async function handleResponse<T>(response: Response, skipAuthRedirect: boolean): Promise<T> {
  if (response.status === 401 && !skipAuthRedirect) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (refreshResponse.ok) {
          isRefreshing = false
          throw new ApiClientError('Token refreshed, retry', 'TOKEN_REFRESHED', 401)
        }
      } finally {
        isRefreshing = false
      }
    }
    // Refresh failed — don't hard redirect, throw so caller handles it
    throw new ApiClientError('Session expired', 'SESSION_EXPIRED', 401)
  }

  if (response.status === 401 && skipAuthRedirect) {
    throw new ApiClientError('Non authentifié', 'UNAUTHORIZED', 401)
  }

  if (!response.ok) {
    const body: ApiError = await response.json().catch(() => ({
      error: response.statusText,
      code: 'UNKNOWN_ERROR',
    }))
    throw new ApiClientError(body.error, body.code, response.status, body.details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export async function api<T>(
  path: string,
  options?: RequestInit & { retry?: boolean; skipAuthRedirect?: boolean }
): Promise<T> {
  const { retry = true, skipAuthRedirect = false, ...fetchOptions } = options ?? {}

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
    })

    return await handleResponse<T>(response, skipAuthRedirect)
  } catch (error) {
    if (error instanceof ApiClientError && error.code === 'TOKEN_REFRESHED' && retry) {
      const response = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
      })
      return await handleResponse<T>(response, skipAuthRedirect)
    }
    throw error
  }
}

export { ApiClientError }
