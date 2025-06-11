/// <reference types="vite/client" />

interface Window {
  RUNTIME_API_KEY?: string
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
