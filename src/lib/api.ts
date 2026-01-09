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
  let timedOut = false
  const timeoutMs = options.timeoutMs ?? requestTimeoutMs
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  if (options.signal?.aborted) {
    controller.abort()
  } else if (options.signal) {
    const abortHandler = () => controller.abort()
    options.signal.addEventListener('abort', abortHandler, { once: true })
  }

  try {
    logDev('Request payload', payload)

    // DO NOT ADD JSON HEADERS HERE - LET THE SERVER HANDLE IT
    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    const rawText = await response.text()
    const data = parseMaybeJson(rawText)

    if (!response.ok) {
      throw new ApiError(buildErrorMessage(response.status, data), response.status, data)
    }

    if (!isTemplateResponse(data)) {
      throw new ApiError('Unexpected response shape', response.status, data)
    }

    logDev('API response', data)
    return data
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (timedOut) {
        throw new ApiError(`Request timed out after ${timeoutMs}ms`, undefined, {
          code: 'timeout'
        })
      }

      throw new ApiError('Request was cancelled', undefined, { code: 'aborted' })
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
  if (isErrorPayload(data) && typeof data.message === 'string') return `${status}: ${data.message}`
  return `Request failed with status ${status}`
}

type ErrorPayload = {
  message?: unknown
}

const isErrorPayload = (value: unknown): value is ErrorPayload =>
  Boolean(value && typeof value === 'object')

const isTemplateData = (value: unknown): value is TemplateResponse['data'] =>
  Boolean(value && typeof value === 'object' && typeof (value as { template?: unknown }).template === 'string')

const isTemplateResponse = (value: unknown): value is TemplateResponse =>
  Boolean(
    value &&
    typeof value === 'object' &&
    typeof (value as { message?: unknown }).message === 'string' &&
    isTemplateData((value as { data?: unknown }).data)
  )
