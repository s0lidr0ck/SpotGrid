/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DB_HOST: string
  readonly VITE_DB_PORT: string
  readonly VITE_DB_NAME: string
  readonly VITE_DB_USER: string
  readonly VITE_DB_PASSWORD: string
  readonly VITE_DB_SSL: string
  readonly VITE_JWT_SECRET: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
