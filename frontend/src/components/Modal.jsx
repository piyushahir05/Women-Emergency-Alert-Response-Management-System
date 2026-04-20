import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: '400px', md: '550px', lg: '720px' };

  return (
    <div style={overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        style={{ ...modalBox, maxWidth: widths[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            {title}
          </h3>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Close">✕</button>
        </div>
        {/* Body */}
        <div style={bodyStyle}>{children}</div>
      </div>
    </div>
  );
}

const overlay = {
  position:        'fixed',
  inset:           0,
  background:      'rgba(0, 0, 0, 0.85)',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  zIndex:          9999,
  backdropFilter:  'blur(4px)',
};

const modalBox = {
  background:   '#1f2937',
  borderRadius: '12px',
  width:        '90%',
  boxShadow:    '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  animation:    'modalFadeIn 0.2s ease',
  border:       '1px solid rgba(239, 68, 68, 0.2)',
};

const headerStyle = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '1rem 1.5rem',
  borderBottom:   '1px solid #374151',
};

const titleStyle = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#fff',
};

const closeBtnStyle = {
  background:   'none',
  border:       'none',
  fontSize:     '1.2rem',
  cursor:       'pointer',
  color:        '#9ca3af',
  padding:      '4px 8px',
  borderRadius: '6px',
  transition:   'all 0.2s',
  lineHeight:   1,
};

const bodyStyle = {
  padding: '1.5rem',
  color: '#d1d5db',
};

// Add this to your global CSS or index.css for animation
// @keyframes modalFadeIn {
//   from {
//     opacity: 0;
//     transform: scale(0.95);
//   }
//   to {
//     opacity: 1;
//     transform: scale(1);
//   }
// }