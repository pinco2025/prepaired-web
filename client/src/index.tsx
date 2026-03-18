import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { isInAppBrowser, redirectToExternalBrowser } from './utils/inAppBrowserRedirect';

// If inside an in-app browser (Instagram, Facebook, etc.), try to redirect
// to the user's default browser before mounting any React components.
let shouldMountApp = true;

if (isInAppBrowser()) {
  const redirected = redirectToExternalBrowser();
  if (redirected) {
    // Android: intent:// redirect is in progress → show a simple loading message
    // and stop React from mounting (the browser will switch to Chrome)
    shouldMountApp = false;
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:'Inter',system-ui,sans-serif;color:#9ca3af;background:#0a0a0f;gap:16px;">
          <div style="width:32px;height:32px;border:3px solid rgba(99,102,241,0.3);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
          <span style="font-size:14px;font-weight:500;">Opening in your browser…</span>
          <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
        </div>
      `;
    }
  }
  // If redirected === false (iOS), shouldMountApp stays true.
  // The InAppBrowserOverlay component inside App.tsx will handle the UI.
}

if (shouldMountApp) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
