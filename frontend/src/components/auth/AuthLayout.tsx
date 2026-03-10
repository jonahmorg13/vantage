import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-sans text-3xl font-extrabold tracking-tight gradient-text">
            Vantage
          </h1>
          <div className="text-text3 text-xs tracking-[0.15em] uppercase mt-1.5">
            Budget Tracking
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">{children}</div>
      </div>
    </div>
  )
}
