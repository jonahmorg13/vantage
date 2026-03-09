import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IMonthRepository } from '../types'
import type { MonthBudget } from '../../types'

export class LocalMonthRepo implements IMonthRepository {
  private dispatch: React.Dispatch<AppAction>

  constructor(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(_monthKey: string): Promise<MonthBudget | null> {
    return null
  }

  async init(monthKey: string): Promise<MonthBudget> {
    this.dispatch({ type: 'INIT_MONTH', monthKey })
    return { monthKey } as MonthBudget
  }

  async updateIncome(monthKey: string, takeHomePay: number): Promise<void> {
    this.dispatch({ type: 'UPDATE_MONTH_INCOME', monthKey, takeHomePay })
  }

  async lock(monthKey: string): Promise<void> {
    this.dispatch({ type: 'LOCK_MONTH', monthKey })
  }
}
