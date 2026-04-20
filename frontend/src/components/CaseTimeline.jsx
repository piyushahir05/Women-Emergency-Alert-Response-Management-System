const STATUS_COLORS = {
  New:          { dot: '#ef4444', line: 'rgba(239, 68, 68, 0.3)' },
  Assigned:     { dot: '#3b82f6', line: 'rgba(59, 130, 246, 0.3)' },
  'In Progress':{ dot: '#f97316', line: 'rgba(249, 115, 22, 0.3)' },
  Resolved:     { dot: '#22c55e', line: 'rgba(34, 197, 94, 0.3)' },
  Closed:       { dot: '#6b7280', line: 'rgba(107, 114, 128, 0.3)' },
};

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CaseTimeline({ historyArray = [] }) {
  if (!historyArray.length) {
    return <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '0.8rem' }}>No history yet.</p>;
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {historyArray.map((entry, idx) => {
        const isLast = idx === historyArray.length - 1;
        const cfg    = STATUS_COLORS[entry.new_status] || STATUS_COLORS.New;

        return (
          <div
            key={entry.history_id || idx}
            style={{
              position:     'relative',
              paddingBottom: isLast ? 0 : '1.5rem',
              animation:    `fadeSlideIn 0.3s ease ${idx * 0.07}s both`,
            }}
          >
            {/* Vertical connector line */}
            {!isLast && (
              <div style={{
                position:   'absolute',
                left:       '-1.35rem',
                top:        '20px',
                bottom:     0,
                width:      '2px',
                background: cfg.line,
              }} />
            )}

            {/* Circle dot */}
            <div style={{
              position:     'absolute',
              left:         '-1.65rem',
              top:          '4px',
              width:        '14px',
              height:       '14px',
              borderRadius: '50%',
              background:   cfg.dot,
              border:       '2px solid #1f2937',
              boxShadow:    `0 0 0 3px ${cfg.line}`,
            }} />

            {/* Content card */}
            <div style={{
              background:   '#1f2937',
              border:       '1px solid #374151',
              borderRadius: '10px',
              padding:      '0.75rem 1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {entry.old_status && (
                  <>
                    <span style={chipStyle('#374151', '#9ca3af')}>{entry.old_status}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>→</span>
                  </>
                )}
                <span style={chipStyle(cfg.dot, '#fff')}>{entry.new_status}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#6b7280' }}>
                  {formatDateTime(entry.changed_at)}
                </span>
              </div>
              {(entry.changed_by || entry.remarks) && (
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#9ca3af' }}>
                  {entry.changed_by && <span>By: <b style={{ color: '#d1d5db' }}>{entry.changed_by}</b></span>}
                  {entry.remarks && <span style={{ marginLeft: '12px' }}>"{entry.remarks}"</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

const chipStyle = (bg, textColor) => ({
  display:         'inline-block',
  background:      bg,
  color:           textColor,
  borderRadius:    '999px',
  padding:         '2px 10px',
  fontSize:        '0.7rem',
  fontWeight:      600,
});