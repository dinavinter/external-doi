/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly GIGYA_API_KEY: string
    readonly GIGYA_DOMAIN: string
    readonly GIGYA_APP_KEY: string
    readonly GIGYA_APP_SECRET: string
 }

interface ImportMeta {
    readonly env: ImportMetaEnv
}
