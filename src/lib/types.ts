export interface GenerateTemplatePayload {
  project_id: string
  customer_id: string
  prompt: string
  template: string
}

export type TemplateImage = string | { url?: string }

export type TemplateChoice = {
  message?: {
    content?: string
  }
}

export type TemplateData = {
  template?: string
  content?: string
  text?: string
  result?: unknown
  message?: string
  body?: string
  images?: TemplateImage[]
  urls?: string[]
  data?: TemplateData | TemplateImage[]
  choices?: TemplateChoice[]
  [key: string]: unknown
}

export type TemplateResponse = TemplateData | string | null
