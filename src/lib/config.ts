const FALLBACK_API_URL =
  'https://bc7z6q05yc.execute-api.us-west-1.amazonaws.com/dev/generate-template'

const getEnvVar = (key: string): string => {
  const envRecord: Record<string, unknown> = import.meta.env
  const value = envRecord[key]
  return typeof value === 'string' ? value : ''
}

export const defaultIds = {
  projectId: 'demo-project',
  customerId: 'demo-customer'
}

export const requestTimeoutMs = 60000
const envUrl = getEnvVar('VITE_API_URL').trim()
export const apiBaseUrl = envUrl || FALLBACK_API_URL
const devFlag = getEnvVar('DEV')
export const isDev = devFlag === 'true' || devFlag === '1'

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
