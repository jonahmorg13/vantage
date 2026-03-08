interface ProgressBarProps {
  percentage: number
  color: string
}

export function ProgressBar({ percentage, color }: ProgressBarProps) {
  return (
    <div className="w-full bg-surface3 rounded h-1.5 overflow-hidden">
      <div
        className="h-full rounded transition-all duration-400"
        style={{ width: `${Math.min(percentage, 100)}%`, background: color }}
      />
    </div>
  )
}
