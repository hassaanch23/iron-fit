import { Platform } from 'react-native';

/**
 * YouTube treats many WebViews as “in-app browsers” and redirects away from the embed player.
 * A Safari / Chrome mobile UA plus an iframe with modern `allow` attributes fixes playback in RN WebView.
 */
export const YOUTUBE_WEBVIEW_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/** Direct embed URL (e.g. opening in SFSafariView / fallback). Prefer www.youtube.com over nocookie in WebViews. */
export function youtubeEmbedWatchUri(videoId: string): string {
  const q = new URLSearchParams({
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    enablejsapi: '1',
  });
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${q.toString()}`;
}

function escapeHtmlAttr(raw: string): string {
  return raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * HTML document with a full-viewport iframe — loads more reliably than `source={{ uri: embed }}` alone.
 */
export function youtubeIframeDocument(videoId: string): string {
  const src = escapeHtmlAttr(youtubeEmbedWatchUri(videoId));
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
  <style>
    html, body { margin: 0; padding: 0; background: #000; height: 100%; width: 100%; overflow: hidden; }
    .wrap { position: fixed; inset: 0; }
    iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <iframe
      src="${src}"
      title="Exercise demo"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      allowfullscreen
    ></iframe>
  </div>
</body>
</html>`;
}
