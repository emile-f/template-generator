import type { TemplateData, TemplateImage, TemplateResponse } from '../lib/types'

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
  const formattedJson = response ? JSON.stringify(response, null, 2) : ''
  const previewText = extractPreviewText(response)
  const imageUrls = extractImageUrls(response)
  const templateContent = extractTemplateContent(response)

  const hasResponse = response !== null

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

  if (!isTemplateRecord(data)) return null

  const candidates = [
    data.content,
    data.template,
    data.text,
    data.result,
    data.message,
    data.body
  ]

  for (const value of candidates) {
    if (typeof value === 'string') return value
  }

  const [firstChoice] = data.choices ?? []
  const nestedMessage = firstChoice?.message?.content
  if (typeof nestedMessage === 'string') return nestedMessage

  return null
}

const extractImageUrls = (data: TemplateResponse): string[] => {
  if (!isTemplateRecord(data)) return []

  const urls = new Set<string>()
  const collectImage = (item: TemplateImage) => {
    if (typeof item === 'string') {
      if (isImageUrl(item)) urls.add(item)
      return
    }

    if (isTemplateImageObject(item) && typeof item.url === 'string' && isImageUrl(item.url)) {
      urls.add(item.url)
    }
  }

  data.images?.forEach(collectImage)
  data.urls?.forEach((url) => {
    if (isImageUrl(url)) urls.add(url)
  })

  if (Array.isArray(data.data)) {
    data.data.forEach(collectImage)
  }

  return Array.from(urls)
}

const isImageUrl = (value: string) =>
  /^https?:\/\//.test(value) && /(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)

const extractTemplateContent = (data: TemplateResponse): string | null => {
  if (!isTemplateRecord(data)) return null
  if (typeof data.template === 'string') return data.template

  if (isTemplateRecord(data.data) && typeof data.data.template === 'string') {
    return data.data.template
  }

  return null
}

const isTemplateRecord = (value: TemplateResponse): value is TemplateData =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

const isTemplateImageObject = (value: TemplateImage): value is { url?: string } =>
  Boolean(value && typeof value === 'object')

export default ResponsePanel
