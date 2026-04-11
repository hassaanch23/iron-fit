import { api } from '@/lib/api';

const TAG = '[IronFit]';

/** Opt-in so Metro stays quiet: set EXPO_PUBLIC_DEBUG=1 in mobile/.env */
export function isIronFitDebugEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_DEBUG === '1';
}

export function debugLog(scope: string, message: string, data?: Record<string, unknown>): void {
  if (!isIronFitDebugEnabled()) return;
  if (data !== undefined) {
    console.log(TAG, scope, message, data);
  } else {
    console.log(TAG, scope, message);
  }
}

/** Fire-and-forget GET /health (only when EXPO_PUBLIC_DEBUG=1). */
export function probeBackendHealth(): void {
  if (!isIronFitDebugEnabled()) return;
  const base = api.defaults.baseURL ?? '';
  const root = base.replace(/\/api\/v1\/?$/, '');
  const url = `${root}/health`;
  debugLog('API', 'probing backend', { baseURL: base, healthUrl: url });
  void fetch(url, { method: 'GET' })
    .then(async (res) => {
      const text = await res.text();
      debugLog('API', 'health response', {
        status: res.status,
        bodyPreview: text.slice(0, 120),
      });
    })
    .catch((err: unknown) => {
      debugLog('API', 'health fetch failed', { error: String(err) });
    });
}
