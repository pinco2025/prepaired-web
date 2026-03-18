import React, { useState } from 'react';

/**
 * InAppBrowserOverlay
 * 
 * A fullscreen overlay shown on iOS when the user is inside an in-app browser
 * (e.g., Instagram). Since iOS doesn't allow programmatic redirect to Safari,
 * this overlay guides the user on how to open the page in Safari manually.
 * 
 * The user can dismiss the overlay to continue using the app in the in-app browser.
 */
const InAppBrowserOverlay: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (dismissed) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Silent fail
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #0a0a0f 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#e5e7eb',
        textAlign: 'center',
      }}
    >
      {/* Subtle glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '20%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          alt="prepAIred logo"
          src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
        />
        <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          prep<span style={{ color: '#6366f1' }}>AI</span>red
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px 24px',
          maxWidth: '380px',
          width: '100%',
          backdropFilter: 'blur(12px)',
          position: 'relative',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
          }}
        >
          🔗
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 8px',
            color: '#f9fafb',
            lineHeight: 1.3,
          }}
        >
          Open in Safari for the best experience
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: '0 0 24px',
            lineHeight: 1.6,
          }}
        >
          You're viewing this inside Instagram's browser. Some features may not work properly here.
        </p>

        {/* Steps */}
        <div
          style={{
            textAlign: 'left',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px',
            }}
          >
            How to open in Safari
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span
                style={{
                  flexShrink: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                1
              </span>
              <span style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.5 }}>
                Tap the <strong style={{ color: '#f3f4f6' }}>⋯</strong> or{' '}
                <strong style={{ color: '#f3f4f6' }}>share</strong> icon at the bottom right
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span
                style={{
                  flexShrink: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                2
              </span>
              <span style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.5 }}>
                Select <strong style={{ color: '#f3f4f6' }}>"Open in Safari"</strong> or{' '}
                <strong style={{ color: '#f3f4f6' }}>"Open in Browser"</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: copied
              ? 'linear-gradient(135deg, #059669, #10b981)'
              : 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            letterSpacing: '0.3px',
          }}
        >
          {copied ? (
            <>
              <span style={{ fontSize: '16px' }}>✓</span> Link Copied!
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>📋</span> Copy Link to Open in Safari
            </>
          )}
        </button>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          marginTop: '20px',
          background: 'none',
          border: 'none',
          color: '#6b7280',
          fontSize: '13px',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'color 0.2s',
        }}
        onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#9ca3af')}
        onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#6b7280')}
      >
        Continue in this browser anyway →
      </button>
    </div>
  );
};

export default InAppBrowserOverlay;
