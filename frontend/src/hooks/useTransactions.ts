import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import type { Transaction } from '../types'

interface UseTransactionsOptions {
  monthKey?: string
  categoryId?: number
  type?: 'expense' | 'income'
  search?: string
  status?: 'confirmed' | 'pending'
  dateFrom?: string
  dateTo?: string
}

export function useTransactions(options: UseTransactionsOptions = {}): Transaction[] {
  const { state } = useAppContext()
  const key = options.monthKey ?? state.currentMonthKey

  return useMemo(() => {
    let filtered = state.transactions.filter(t => t.monthKey === key)

    if (options.categoryId !== undefined) {
      filtered = filtered.filter(t => t.categoryId === options.categoryId)
    }
    if (options.type) {
      filtered = filtered.filter(t => t.type === options.type)
    }
    if (options.status) {
      filtered = filtered.filter(t => t.status === options.status)
    }
    if (options.search) {
      const q = options.search.toLowerCase()
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q))
    }
    if (options.dateFrom) {
      filtered = filtered.filter(t => t.date >= options.dateFrom!)
    }
    if (options.dateTo) {
      filtered = filtered.filter(t => t.date <= options.dateTo!)
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  }, [state.transactions, key, options.categoryId, options.type, options.search, options.status, options.dateFrom, options.dateTo])
}

export function useSpentByCategory(monthKey?: string): Map<number, number> {
  const { state } = useAppContext()
  const key = monthKey ?? state.currentMonthKey

  return useMemo(() => {
    const map = new Map<number, number>()
    state.transactions
      .filter(t => t.monthKey === key && t.status === 'confirmed' && t.type === 'expense' && t.categoryId != null)
      .forEach(t => {
        const cid = t.categoryId!
        map.set(cid, (map.get(cid) ?? 0) + t.amount)
      })
    return map
  }, [state.transactions, key])
}
