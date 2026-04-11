import * as Linking from 'expo-linking';

export function extractOAuthCodeFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const qp = parsed.queryParams?.code;
  if (typeof qp === 'string') return qp;
  if (Array.isArray(qp) && qp[0]) return qp[0];

  const hashIdx = url.indexOf('#');
  if (hashIdx >= 0) {
    const hash = url.slice(hashIdx + 1);
    const params = new URLSearchParams(hash);
    const fromHash = params.get('code');
    if (fromHash) return fromHash;
  }

  const queryIdx = url.indexOf('?');
  if (queryIdx >= 0) {
    const query = url.slice(queryIdx + 1).split('#')[0];
    const params = new URLSearchParams(query);
    return params.get('code');
  }

  return null;
}

export function extractTokensFromUrl(url: string): { access_token: string; refresh_token: string } | null {
  const fragment = url.includes('#') ? url.split('#')[1] : '';
  const search = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
  const params = new URLSearchParams(fragment || search || '');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    return { access_token, refresh_token };
  }
  return null;
}
