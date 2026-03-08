import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import type { MonthBudget } from '../types'

export function useMonthBudget(monthKey?: string): MonthBudget | null {
  const { state } = useAppContext()
  const key = monthKey ?? state.currentMonthKey

  return useMemo(
    () => state.monthBudgets.find(m => m.monthKey === key) ?? null,
    [state.monthBudgets, key]
  )
}

export function useCurrentMonth() {
  const { state } = useAppContext()
  return useMonthBudget(state.currentMonthKey)
}
