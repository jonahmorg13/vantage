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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-surface border border-border rounded-2xl p-8 w-[480px] max-w-[95vw] animate-slide-up">
        <h2 className="font-sans text-xl font-bold mb-6 text-text">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function FormGroup({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-xs text-text3 tracking-[0.1em] uppercase mb-2">{label}</label>
      {children}
      {error && <p className="text-danger text-xs mt-1.5">{error}</p>}
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

interface MoneyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  value: string
  onChange: (value: string) => void
}

export function MoneyInput({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = '0.00',
  ...props
}: MoneyInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    onChange(filtered)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const num = parseFloat(value)
    if (!isNaN(num)) onChange(num.toFixed(2))
    onBlur?.(e)
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select()
    onFocus?.(e)
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`w-full bg-surface2 border border-border text-text font-mono text-sm px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:border-accent ${props.className ?? ''}`}
    />
  )
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-surface2 border border-border text-text font-mono text-sm pl-4 pr-10 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:border-accent appearance-none ${props.className ?? ''}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        ...props.style,
      }}
    />
  )
}
