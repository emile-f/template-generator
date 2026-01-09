const FALLBACK_API_URL =
  'https://bc7z6q05yc.execute-api.us-west-1.amazonaws.com/dev/generate-template'

export const defaultIds = {
  projectId: 'demo-project',
  customerId: 'demo-customer'
}

export const requestTimeoutMs = 60000
export const apiBaseUrl = (import.meta.env?.VITE_API_URL || '').toString().trim() || FALLBACK_API_URL
export const isDev = Boolean(import.meta.env?.DEV)

export const logDev = (...messages: unknown[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug('[template-generator]', ...messages)
  }
}

export const config = {
  apiBaseUrl,
  requestTimeoutMs,
  defaultIds
}

export { FALLBACK_API_URL }
