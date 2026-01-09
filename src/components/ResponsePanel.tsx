import { useMemo } from 'react'
import type { TemplateResponse } from '../lib/types'

type ResponsePanelProps = {
  response: TemplateResponse
  loading: boolean
  error: string | null
  status: string
  onCopy: (content: string, label: 'json' | 'text') => Promise<void> | void
  onRetry: () => void
}

const ResponsePanel = ({
  response,
  loading,
  error,
  status,
  onCopy,
  onRetry
}: ResponsePanelProps) => {
  const formattedJson = useMemo(() => {
    if (!response) return ''
    try {
      return JSON.stringify(response, null, 2)
    } catch (serializationError) {
      console.warn('Unable to stringify response', serializationError)
      return String(response)
    }
  }, [response])

  const previewText = useMemo(() => extractPreviewText(response), [response])
  const imageUrls = useMemo(() => extractImageUrls(response), [response])
  const templateContent = useMemo(() => extractTemplateContent(response), [response])

  const hasResponse = Boolean(response)

  return (
    <div className="glass-card response-card" aria-live="polite">
      <div className="card-head">
        <div>
          <p className="eyebrow">Response</p>
          <h2>Preview & Debug</h2>
          <p className="muted">Raw JSON plus a quick preview when we can detect text or images.</p>
        </div>
        <span className={`pill ${loading ? 'pill-live' : 'pill-ghost'}`}>
          {loading ? 'Sending...' : error ? 'Error' : hasResponse ? 'Complete' : 'Idle'}
        </span>
      </div>

      {error && (
        <div className="banner error">
          <div>
            <p className="banner-title">Request failed</p>
            <p className="banner-copy">{error}</p>
          </div>
          <button className="btn secondary" onClick={() => onRetry()} disabled={loading}>
            Retry
          </button>
        </div>
      )}

      {previewText && (
        <div className="preview-block">
          <div className="block-header">
            <h3>Preview</h3>
            <button
              className="btn ghost"
              onClick={() => {
                void onCopy(previewText, 'text')
              }}
              disabled={loading}
            >
              Copy text
            </button>
          </div>
          <p className="preview-text">{previewText}</p>
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="preview-block">
          <div className="block-header">
            <h3>Images</h3>
          </div>
          <div className="image-grid">
            {imageUrls.map((url) => (
              <div key={url} className="image-frame">
                <img src={url} alt="Generated" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="preview-block">
        <div className="block-header">
          <h3>Raw JSON</h3>
          <button
            className="btn ghost"
            onClick={() => {
              if (formattedJson) {
                void onCopy(formattedJson, 'json')
              }
            }}
            disabled={!formattedJson || loading}
          >
            Copy JSON
          </button>
        </div>
        <pre className="code-block" aria-live="polite">
          {formattedJson || 'Responses will appear here after you submit the form.'}
        </pre>
      </div>

      {templateContent && (
        <div className="preview-block">
          <div className="block-header">
            <h3>Template Output</h3>
            <button
              className="btn ghost"
              onClick={() => {
                void onCopy(templateContent, 'text')
              }}
              disabled={loading}
            >
              Copy template
            </button>
          </div>
          <pre className="code-block code-block-scroll">{templateContent}</pre>
        </div>
      )}

      <div className="status-row" role="status" aria-live="polite">
        <span className={`status-dot ${loading ? 'pulse' : ''}`} aria-hidden />
        <span className="muted">{status}</span>
      </div>
    </div>
  )
}

const extractPreviewText = (data: TemplateResponse): string | null => {
  if (!data) return null
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    const record = data as Record<string, unknown>
    const keys = ['content', 'template', 'text', 'result', 'message', 'body']
    for (const key of keys) {
      const value = record[key]
      if (typeof value === 'string') return value
    }

    const choices = record.choices
    if (Array.isArray(choices) && choices.length > 0) {
      const firstChoice = choices[0] as Record<string, unknown>
      const nestedMessage = (firstChoice.message as Record<string, unknown>)?.content
      if (typeof nestedMessage === 'string') return nestedMessage
    }
  }

  return null
}

const extractImageUrls = (data: TemplateResponse): string[] => {
  if (!data || typeof data !== 'object') return []
  const record = data as Record<string, unknown>
  const urls = new Set<string>()

  const candidates = [record.images, record.urls, record.data].filter(Array.isArray) as unknown[][]

  candidates.forEach((collection) => {
    collection.forEach((item) => {
      if (typeof item === 'string' && isImageUrl(item)) urls.add(item)
      if (item && typeof item === 'object') {
        const url = (item as Record<string, unknown>).url
        if (typeof url === 'string' && isImageUrl(url)) urls.add(url)
      }
    })
  })

  return Array.from(urls)
}

const isImageUrl = (value: string) =>
  /^https?:\/\//.test(value) && /(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)

const extractTemplateContent = (data: TemplateResponse): string | null => {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>

  if (typeof record.template === 'string') return record.template

  const nestedData = record.data
  if (nestedData && typeof nestedData === 'object') {
    const template = (nestedData as Record<string, unknown>).template
    if (typeof template === 'string') return template
  }

  return null
}

export default ResponsePanel
