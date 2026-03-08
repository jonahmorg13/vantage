interface StatusPillProps {
  status: 'ok' | 'warn' | 'over' | 'none'
}

export function StatusPill({ status }: StatusPillProps) {
  const styles = {
    ok: 'bg-success/12 text-success',
    warn: 'bg-warning/12 text-warning',
    over: 'bg-danger/12 text-danger animate-pulse-status',
    none: 'bg-white/5 text-text3',
  }

  const labels = {
    ok: '✓ OK',
    warn: '~ Near',
    over: '⚠ OVER',
    none: '—',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
