export function formatCurrency(n: number, symbol = '$'): string {
  return (
    symbol +
    Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatCurrencySigned(n: number): string {
  const prefix = n < 0 ? '-' : ''
  return prefix + formatCurrency(n)
}

export function getCurrentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthKeyToDate(monthKey: string): Date {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

export function formatMonthDisplay(monthKey: string): string {
  const date = monthKeyToDate(monthKey)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function prevMonthKey(monthKey: string): string {
  const date = monthKeyToDate(monthKey)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonthKey(monthKey: string): string {
  const date = monthKeyToDate(monthKey)
  date.setMonth(date.getMonth() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function nowISO(): string {
  return new Date().toISOString()
}
