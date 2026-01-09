import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, generateTemplate } from './api'
import { FALLBACK_API_URL } from './config'

const basePayload = {
  project_id: 'demo-project',
  customer_id: 'demo-customer',
  prompt: 'Write a welcome email',
  template: 'Hello {{user}}'
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('generateTemplate', () => {
  it('posts payload and returns parsed JSON when successful', async () => {
    const mockResponse = { result: 'ok', content: 'Hello' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse))
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await generateTemplate(basePayload, { timeoutMs: 200 })

    expect(result).toEqual(mockResponse)
    const expectedHeaders = expect.objectContaining({ 'Content-Type': 'application/json' })
    expect(fetchMock).toHaveBeenCalledWith(
      FALLBACK_API_URL,
      expect.objectContaining({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(basePayload)
      })
    )
  })

  it('throws ApiError when the server responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(JSON.stringify({ message: 'boom' }))
      })
    )

    await expect(generateTemplate(basePayload)).rejects.toBeInstanceOf(ApiError)
  })

  it('aborts and reports a timeout when the request takes too long', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, options: RequestInit = {}) => {
        const { signal } = options
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
      })
    )

    await expect(generateTemplate(basePayload, { timeoutMs: 5 })).rejects.toThrow(/timed out/i)
  })
})
