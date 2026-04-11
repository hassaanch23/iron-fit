import * as WebBrowser from 'expo-web-browser';

import { extractOAuthCodeFromUrl, extractTokensFromUrl } from '@/lib/oauth-parse';
import { getAuthRedirectUri, supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogleOAuth(): Promise<void> {
  const redirectTo = getAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned from Supabase');

  if (__DEV__) {
    console.log('[IronFit] OAuth URL =', data.url);
    console.log('[IronFit] Listening for redirect to =', redirectTo);
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !('url' in result) || !result.url) {
    return;
  }

  const returnUrl = result.url;
  const code = extractOAuthCodeFromUrl(returnUrl);
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return;
  }

  const tokens = extractTokensFromUrl(returnUrl);
  if (tokens) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    if (sessionError) throw sessionError;
    return;
  }

  throw new Error('Could not complete Google sign-in from redirect URL');
}
