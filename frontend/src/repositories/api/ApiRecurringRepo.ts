import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IRecurringRepository } from '../types'
import type { RecurringTransaction, Transaction, MonthBudget } from '../../types'
import type { ApiClient } from './ApiClient'
import { getCurrentMonthKey } from '../../utils/format'

export class ApiRecurringRepo implements IRecurringRepository {
  private client: ApiClient
  private dispatch: React.Dispatch<AppAction>

  constructor(client: ApiClient, dispatch: React.Dispatch<AppAction>) {
    this.client = client
    this.dispatch = dispatch
  }

  async create(
    data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringTransaction> {
    const recurring = await this.client.post<RecurringTransaction>('/api/recurring', data)
    this.dispatch({ type: 'ADD_RECURRING', recurring })

    // Backend creates a pending transaction for the current month — re-fetch to sync
    if (data.isActive) {
      const monthKey = getCurrentMonthKey()
      try {
        const [month, transactions] = await Promise.all([
          this.client.get<MonthBudget>(`/api/months/${monthKey}`),
          this.client.get<Transaction[]>(`/api/transactions?monthKey=${monthKey}`),
        ])
        this.dispatch({ type: 'SET_MONTH_DATA', month, transactions })
      } catch {
        // Month may not exist yet
      }
    }

    return recurring
  }

  async update(id: number, data: Partial<RecurringTransaction>): Promise<void> {
    const recurring = await this.client.put<RecurringTransaction>(`/api/recurring/${id}`, data)
    this.dispatch({ type: 'UPDATE_RECURRING', id, updates: recurring })
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/recurring/${id}`)
    this.dispatch({ type: 'DELETE_RECURRING', id })
  }
}
