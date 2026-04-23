import { useState, useEffect, useRef } from 'react';
import { ScanLoader } from './ScanLoader';
import { CTAButton } from '@/components/CTAButton';

// ============================================
// TYPES
// ============================================

interface FullscreenLoaderProps {
  /** Contextual message, e.g. 'GENERATING WORKOUT' */
  message: string;
  /** Controls show/hide */
  visible: boolean;
  /** Optional cancel callback — shows an abort button when provided */
  onCancel?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const TYPEWRITER_MS = 42;

// ============================================
// COMPONENT
// ============================================

export const FullscreenLoader = ({ message, visible, onCancel }: FullscreenLoaderProps) => {
  const [displayText, setDisplayText] = useState('');
  const typewriterRef = useRef<ReturnType<typeof setInterval>>(null);

  // Typewriter on mount / message change when visible
  useEffect(() => {
    if (!visible) return;

    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setDisplayText('');
    let i = 0;
    typewriterRef.current = setInterval(() => {
      if (i < message.length) {
        i++;
        setDisplayText(message.slice(0, i));
      } else {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
      }
    }, TYPEWRITER_MS);

    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [visible, message]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(23, 23, 23, 0.15)',
      }}
    >
      {/* Canvas — fills entire screen */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ScanLoader direction="bounce" running={visible} />
      </div>

      {/* Message — centered */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '18px',
          fontFamily: "'Oxanium', monospace",
          fontWeight: 600,
          fontSize: '11px',
          letterSpacing: '0.32em',
          color: 'var(--text-card-header)',
          textTransform: 'uppercase',
        }}
      >
        {displayText}
      </div>

      {/* Cancel button — same position/size as the Generate CTA underneath */}
      {onCancel && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--spacing-400)', zIndex: 10 }}>
          <div style={{ maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
            <CTAButton variant="secondary" size="lg" fullWidth onClick={onCancel}>
              Cancel
            </CTAButton>
          </div>
        </div>
      )}
    </div>
  );
};
