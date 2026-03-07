/// <reference types="vite/client" />

// Tauri plugins are dynamically imported at runtime only when in Tauri context
declare module '@tauri-apps/plugin-notification' {
    export function isPermissionGranted(): Promise<boolean>;
    export function requestPermission(): Promise<string>;
    export function sendNotification(options: { title: string; body: string }): void;
}
