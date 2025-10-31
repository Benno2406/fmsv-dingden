/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly MODE?: string;
  // weitere env Variablen hier hinzufügen
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
