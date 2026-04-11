import type { ComponentType } from 'react';

/** Avoid static import — it crashes when RNCWebView isn’t in the binary (Expo Go, stale native build). */
export function getNativeWebViewOrNull(): ComponentType<any> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-webview').WebView;
  } catch {
    return null;
  }
}
