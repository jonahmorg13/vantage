import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base =
    'px-4 py-2 rounded-lg font-mono text-sm cursor-pointer transition-all duration-150 tracking-wide'

  const variants = {
    primary: 'bg-accent text-white border-none hover:bg-accent-hover hover:-translate-y-px',
    secondary:
      'bg-transparent border border-border text-text2 hover:border-accent hover:text-accent',
    danger: 'bg-danger text-white border-none hover:bg-danger-hover hover:-translate-y-px',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
