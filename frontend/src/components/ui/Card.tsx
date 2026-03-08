import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  accentColor?: string
  className?: string
}

export function Card({ children, accentColor, className = '' }: CardProps) {
  return (
    <div
      className={`card-accent relative overflow-hidden bg-surface border border-border rounded-xl p-6 transition-colors duration-200 ${className}`}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs text-text3 tracking-[0.15em] uppercase mb-3">
      {children}
    </div>
  )
}

export function CardValue({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`font-sans text-3xl font-bold tracking-tight ${className}`}>
      {children}
    </div>
  )
}

export function CardSub({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm text-text2 mt-2">
      {children}
    </div>
  )
}
