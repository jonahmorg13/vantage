import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IMonthRepository } from '../types'
import type { MonthBudget } from '../../types'
import type { ApiClient } from './ApiClient'

export class ApiMonthRepo implements IMonthRepository {
  private client: ApiClient
  private dispatch: React.Dispatch<AppAction>

  constructor(client: ApiClient, dispatch: React.Dispatch<AppAction>) {
    this.client = client
    this.dispatch = dispatch
  }

  async get(monthKey: string): Promise<MonthBudget | null> {
    try {
      return await this.client.get<MonthBudget>(`/months/${monthKey}`)
    } catch {
      return null
    }
  }

  async init(monthKey: string): Promise<MonthBudget> {
    return await this.client.post<MonthBudget>(`/months/${monthKey}/init`)
  }

  async updateIncome(monthKey: string, takeHomePay: number): Promise<void> {
    await this.client.put(`/months/${monthKey}/income`, { takeHomePay })
    this.dispatch({ type: 'UPDATE_MONTH_INCOME', monthKey, takeHomePay })
  }

  async lock(monthKey: string): Promise<void> {
    await this.client.post(`/months/${monthKey}/lock`)
    this.dispatch({ type: 'LOCK_MONTH', monthKey })
  }
}
