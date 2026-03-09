import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[200] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border animate-slide-up pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-surface border-accent3/30 text-accent3'
                : 'bg-surface border-danger/30 text-danger'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
