import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, action, children, className = '' }: PanelProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface2">
        <span className="font-sans text-sm font-bold tracking-[0.05em] uppercase text-text2">
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}
