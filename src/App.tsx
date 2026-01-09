import { FormEvent, useState } from 'react'
import FormField from './components/FormField'
import ResponsePanel from './components/ResponsePanel'
import { generateTemplate, ApiError } from './lib/api'
import { apiBaseUrl, defaultIds } from './lib/config'
import { sampleData } from './lib/sampleData'
import type { GenerateTemplatePayload, TemplateResponse } from './lib/types'

const apiHost = new URL(apiBaseUrl, 'http://localhost').host

const initialFormState = {
  projectId: '',
  customerId: '',
  prompt: '',
  template: ''
}

type FormState = typeof initialFormState

type FormErrors = Partial<Record<keyof FormState, string>>

const App = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [response, setResponse] = useState<TemplateResponse>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Ready to generate a new template.')
  const [copiedState, setCopiedState] = useState<'json' | 'text' | null>(null)

  const validate = (state: FormState) => {
    const nextErrors: FormErrors = {}
    if (!state.prompt.trim()) nextErrors.prompt = 'Prompt is required to guide the generator.'
    if (!state.template.trim()) nextErrors.template = 'Template is required to preview output.'
    return nextErrors
  }

  const buildPayload = (state: FormState): GenerateTemplatePayload => ({
    project_id: state.projectId.trim() || defaultIds.projectId,
    customer_id: state.customerId.trim() || defaultIds.customerId,
    prompt: state.prompt.trim(),
    template: state.template.trim()
  })

  const sendRequest = async () => {
    setCopiedState(null)

    const validationErrors = validate(formState)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length) {
      setStatusText('Please fix the highlighted fields before sending.')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setStatusText('Sending request to the template generator...')

    try {
      const payload = buildPayload(formState)
      const data = await generateTemplate(payload)
      setResponse(data)
      setStatusText('Response received. Preview or copy below.')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please retry.'
      setErrorMessage(message)
      setStatusText('Request failed. Review the error and retry.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendRequest()
  }

  const handleReset = () => {
    setFormState(initialFormState)
    setErrors({})
    setResponse(null)
    setErrorMessage(null)
    setStatusText('Cleared. Add your prompt and template to send a new request.')
    setCopiedState(null)
  }

  const handleSampleData = () => {
    setFormState(sampleData)
    setErrors({})
    setErrorMessage(null)
    setStatusText('Sample data loaded. Adjust and submit to see a live response.')
    setCopiedState(null)
  }

  const handleCopy = async (content: string, label: 'json' | 'text') => {
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopiedState(label)
      setTimeout(() => setCopiedState(null), 2000)
    } catch (error) {
      console.error('Copy failed', error)
      setStatusText('Copy failed. Your browser may not allow clipboard access here.')
    }
  }

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const retryRequest = () => {
    void sendRequest()
  }

  return (
    <div className="app-shell">
      <div className="blob blob-1" aria-hidden />
      <div className="blob blob-2" aria-hidden />
      <div className="blob blob-3" aria-hidden />

      <main className="page">
        <header className="hero">
          <div className="badge">AI-generated templates</div>
          <h1>Template Generator Frontend</h1>
          <p className="lede">
            Send your prompt, template, and optional identifiers to the backend, preview the JSON
            response, and copy the generated content.
          </p>
        </header>

        <section className="content-grid">
          <div className="glass-card form-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">Request builder</p>
                <h2>Provide context and template</h2>
                <p className="muted">
                  Prompts and templates are required. Identifiers are optional and default to
                  demo-friendly values if left empty.
                </p>
              </div>
              <span className="pill pill-ghost">POST {apiHost}</span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="form"
              aria-label="Template request form"
            >
              <div className="field-grid">
                <FormField
                  id="project_id"
                  label="Project ID"
                  value={formState.projectId}
                  onChange={(value) => updateField('projectId', value)}
                  placeholder="e.g. onboarding-suite"
                  helpText={`Optional. Defaults to "${defaultIds.projectId}" if empty.`}
                  disabled={loading}
                />
                <FormField
                  id="customer_id"
                  label="Customer ID"
                  value={formState.customerId}
                  onChange={(value) => updateField('customerId', value)}
                  placeholder="e.g. acme-co"
                  helpText={`Optional. Defaults to "${defaultIds.customerId}" if empty.`}
                  disabled={loading}
                />
              </div>

              <FormField
                id="prompt"
                label="Prompt"
                value={formState.prompt}
                onChange={(value) => updateField('prompt', value)}
                placeholder="Tell the AI what to generate, tone, and constraints."
                helpText="Required. Describe the output style, tone, and any brand constraints."
                required
                type="textarea"
                rows={3}
                autoGrow
                maxHeight={300}
                disabled={loading}
                error={errors.prompt}
              />

              <FormField
                id="template"
                label="Template"
                value={formState.template}
                onChange={(value) => updateField('template', value)}
                placeholder="Use {{placeholders}} to map your variables."
                helpText="Required. Include placeholders like {{user_name}} or {{cta_link}} that the backend will fill."
                required
                type="textarea"
                rows={8}
                autoGrow
                maxHeight={420}
                monospace
                disabled={loading}
                error={errors.template}
              />

              <div className="control-row">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden /> Sending...
                    </>
                  ) : (
                    'Send to API'
                  )}
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={handleSampleData}
                  disabled={loading}
                >
                  Use sample data
                </button>
              </div>

              <div className="status-row" role="status" aria-live="polite">
                <span className={`status-dot ${loading ? 'pulse' : ''}`} aria-hidden />
                <span className="muted">{statusText}</span>
                {copiedState && <span className="pill pill-ghost">Copied {copiedState}</span>}
              </div>
            </form>
          </div>

          <ResponsePanel
            response={response}
            loading={loading}
            error={errorMessage}
            status={statusText}
            onCopy={handleCopy}
            onRetry={retryRequest}
          />
        </section>
      </main>
    </div>
  )
}

export default App
