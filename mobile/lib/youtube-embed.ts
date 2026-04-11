import { Platform } from 'react-native';

/**
 * YouTube error 152 in WebViews often happens when the *top-level* document is not a real youtube.com
 * page (e.g. about:blank + iframe). Load the embed URL directly as WebView `source.uri` with a mobile
 * Safari/Chrome UA. See: https://stackoverflow.com/questions/79901141
 */
export const YOUTUBE_WEBVIEW_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/**
 * Top-level embed URL for WebView — document origin is youtube.com (avoids many 152 cases).
 * `origin` helps YouTube’s embed checks; omit enablejsapi (some builds misbehave with it).
 */
export function youtubeEmbedWatchUri(videoId: string): string {
  const q = new URLSearchParams({
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    origin: 'https://www.youtube.com',
  });
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${q.toString()}`;
}
