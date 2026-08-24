import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  before_send: (payload: any) => {
    const sanitizeUrl = (url: string) => {
      if (typeof url === 'string' && (url.includes('access_token=') || url.includes('refresh_token=') || url.includes('provider_token='))) {
        return url.split('#')[0]
      }
      return url
    }

    if (payload.properties) {
      if (payload.properties.$current_url) {
        payload.properties.$current_url = sanitizeUrl(payload.properties.$current_url)
      }
      if (payload.properties.$pathname) {
        payload.properties.$pathname = sanitizeUrl(payload.properties.$pathname)
      }
      if (payload.properties.$set_once && payload.properties.$set_once.$initial_current_url) {
        payload.properties.$set_once.$initial_current_url = sanitizeUrl(payload.properties.$set_once.$initial_current_url)
      }
      if (payload.properties.$set_once && payload.properties.$set_once.$initial_pathname) {
        payload.properties.$set_once.$initial_pathname = sanitizeUrl(payload.properties.$set_once.$initial_pathname)
      }
    }
    return payload
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>,
)
