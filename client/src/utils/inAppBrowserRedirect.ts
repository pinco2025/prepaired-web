/**
 * In-App Browser Detection & Redirect Utility
 * 
 * Detects if the user is browsing inside a social media in-app browser
 * (Instagram, Facebook, Twitter, etc.) and redirects them to their
 * device's default browser for full functionality.
 */

const IN_APP_BROWSER_PATTERNS = [
  'Instagram',       // Instagram in-app browser
  'FBAN',            // Facebook App
  'FBAV',            // Facebook App (version indicator)
  'Twitter',         // Twitter / X app
  'LinkedInApp',     // LinkedIn app
  'Snapchat',        // Snapchat
  'Line/',           // LINE messenger
  'KAKAOTALK',       // KakaoTalk
  'Pinterest/',      // Pinterest
  'MicroMessenger',  // WeChat
];

/**
 * Check if the current browser is an in-app browser (Instagram, Facebook, etc.)
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return IN_APP_BROWSER_PATTERNS.some(pattern => ua.indexOf(pattern) > -1);
}

/**
 * Detect if the device is running iOS
 */
export function getIsIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect if the device is running Android
 */
export function getIsAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Attempt to redirect the user to their default external browser.
 * 
 * - Android: Uses intent:// URI to open Chrome directly. Returns true.
 * - iOS: Cannot programmatically open Safari. Returns false so the
 *        caller can show a fallback UI (overlay with instructions).
 * 
 * @returns true if auto-redirect was initiated (Android), false if fallback UI is needed (iOS/other)
 */
export function redirectToExternalBrowser(): boolean {
  const currentUrl = window.location.href;

  if (getIsAndroid()) {
    // Build an Android intent URL that opens the current page in Chrome
    // Format: intent://HOST/PATH#Intent;scheme=https;package=com.android.chrome;end
    try {
      const url = new URL(currentUrl);
      const intentUrl = `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=${url.protocol.replace(':', '')};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
      window.location.href = intentUrl;
      return true;
    } catch {
      // If URL parsing fails, try a simpler approach
      const stripped = currentUrl.replace(/^https?:\/\//, '');
      const scheme = currentUrl.startsWith('https') ? 'https' : 'http';
      window.location.href = `intent://${stripped}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
      return true;
    }
  }

  // iOS and other platforms: no reliable way to auto-redirect
  // Return false to signal that the caller should show fallback UI
  return false;
}
