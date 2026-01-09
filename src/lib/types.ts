export interface GenerateTemplatePayload {
  project_id: string
  customer_id: string
  prompt: string
  template: string
}

export type TemplateData = {
  template: string
}

export type TemplateResponse = {
  message: string
  data: TemplateData
}
