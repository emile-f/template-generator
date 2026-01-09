import type { TemplateResponse } from '../lib/types'

type ResponsePanelProps = {
  response: TemplateResponse | null
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
  const templateContent = response?.data.template ?? ''

  const hasResponse = response !== null

  return (
    <div className="glass-card response-card" aria-live="polite">
      <div className="card-head">
        <div>
          <p className="eyebrow">Response</p>
          <h2>Preview & Debug</h2>
          <p className="muted">Raw JSON plus a quick preview of the template content.</p>
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

export default ResponsePanel
