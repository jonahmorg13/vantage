import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-border rounded-2xl p-8 w-[480px] max-w-[95vw] animate-slide-up">
        <h2 className="font-sans text-xl font-bold mb-6 text-text">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-xs text-text3 tracking-[0.1em] uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-surface2 border border-border text-text font-mono text-sm px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:border-accent ${props.className ?? ''}`}
    />
  )
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-surface2 border border-border text-text font-mono text-sm px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:border-accent ${props.className ?? ''}`}
    />
  )
}
