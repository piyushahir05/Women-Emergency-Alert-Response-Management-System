const STATUS_CONFIG = {
  'New':         { bg: '#ef4444', label: 'New', glow: 'rgba(239, 68, 68, 0.3)' },
  'Assigned':    { bg: '#3b82f6', label: 'Assigned', glow: 'rgba(59, 130, 246, 0.3)' },
  'In Progress': { bg: '#f97316', label: 'In Progress', glow: 'rgba(249, 115, 22, 0.3)' },
  'Resolved':    { bg: '#22c55e', label: 'Resolved', glow: 'rgba(34, 197, 94, 0.3)' },
  'Closed':      { bg: '#6b7280', label: 'Closed', glow: 'rgba(107, 114, 128, 0.3)' },
  'Active':      { bg: '#ef4444', label: 'Active', glow: 'rgba(239, 68, 68, 0.3)' },
};

const PRIORITY_CONFIG = {
  'Low':      { bg: '#6b7280', label: 'Low', glow: 'rgba(107, 114, 128, 0.3)' },
  'Medium':   { bg: '#eab308', label: 'Medium', glow: 'rgba(234, 179, 8, 0.3)' },
  'High':     { bg: '#f97316', label: 'High', glow: 'rgba(249, 115, 22, 0.3)' },
  'Critical': { bg: '#ef4444', label: 'Critical', glow: 'rgba(239, 68, 68, 0.3)' },
};

export default function StatusBadge({ status, type = 'status' }) {
  const config =
    type === 'priority'
      ? PRIORITY_CONFIG[status] || { bg: '#6b7280', label: status, glow: 'rgba(107, 114, 128, 0.3)' }
      : STATUS_CONFIG[status]  || { bg: '#6b7280', label: status, glow: 'rgba(107, 114, 128, 0.3)' };

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: config.bg,
        color: '#fff',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        boxShadow: `0 0 4px ${config.glow}`,
        textTransform: 'uppercase',
      }}
    >
      {config.label || status}
    </span>
  );
}