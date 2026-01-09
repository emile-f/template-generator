import { ChangeEvent, useEffect, useRef } from 'react'

export type FormFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'textarea'
  required?: boolean
  placeholder?: string
  helpText?: string
  disabled?: boolean
  error?: string
  rows?: number
  monospace?: boolean
  autoGrow?: boolean
  maxHeight?: number
}

const FormField = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  helpText,
  disabled,
  error,
  rows = 3,
  monospace,
  autoGrow,
  maxHeight
}: FormFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (type === 'textarea' && autoGrow && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      const nextHeight = Math.min(el.scrollHeight, maxHeight ?? el.scrollHeight)
      el.style.height = `${nextHeight}px`
    }
  }, [value, type, autoGrow, maxHeight])

  const sharedProps = {
    id,
    name: id,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    placeholder,
    disabled,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': helpText ? `${id}-help` : undefined
  }

  return (
    <div className={`field ${error ? 'field-error' : ''}`}>
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {required && <span className="required-pill">Required</span>}
      </div>

      {type === 'textarea' ? (
        <textarea
          ref={textareaRef}
          className={`field-input textarea ${monospace ? 'monospace' : ''}`}
          rows={rows}
          style={{
            maxHeight: maxHeight ? `${maxHeight}px` : undefined
          }}
          {...sharedProps}
          onInput={
            autoGrow
              ? (event) => {
                  const target = event.currentTarget
                  target.style.height = 'auto'
                  const nextHeight = Math.min(target.scrollHeight, maxHeight ?? target.scrollHeight)
                  target.style.height = `${nextHeight}px`
                }
              : undefined
          }
        />
      ) : (
        <input type="text" className="field-input" {...sharedProps} />
      )}

      <div className="field-meta">
        {helpText && (
          <p id={`${id}-help`} className="help-text">
            {helpText}
          </p>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}

export default FormField
