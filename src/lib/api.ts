import { apiBaseUrl, logDev, requestTimeoutMs } from './config'
import type { GenerateTemplatePayload, TemplateResponse } from './types'

export class ApiError extends Error {
  status?: number
  data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export type GenerateTemplateOptions = {
  timeoutMs?: number
  signal?: AbortSignal
}

export async function generateTemplate(
  payload: GenerateTemplatePayload,
  options: GenerateTemplateOptions = {}
): Promise<TemplateResponse> {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? requestTimeoutMs
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (options.signal) {
    const externalSignal = options.signal
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason as DOMException)
    } else {
      const abortHandler = () => controller.abort(externalSignal.reason as DOMException)
      externalSignal.addEventListener('abort', abortHandler, { once: true })
    }
  }

  try {
    logDev('Request payload', payload)

    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    const rawText = await response.text()
    const data = parseMaybeJson(rawText)

    if (!response.ok) {
      throw new ApiError(buildErrorMessage(response.status, data), response.status, data)
    }

    logDev('API response', data)
    return data
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, undefined, {
        code: 'timeout'
      })
    }

    if (error instanceof ApiError) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'Request failed'
    throw new ApiError(message, undefined, error)
  } finally {
    clearTimeout(timeoutId)
  }
}

const parseMaybeJson = (raw: string): unknown => {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    logDev('Response is not JSON, returning raw text', error)
    return raw
  }
}

const buildErrorMessage = (status: number, data: unknown): string => {
  if (typeof data === 'string') return `${status}: ${data}`
  if (data && typeof data === 'object') {
    const message = (data as Record<string, unknown>).message
    if (typeof message === 'string') return `${status}: ${message}`
  }
  return `Request failed with status ${status}`
}
