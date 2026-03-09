import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IRecurringRepository } from '../types'
import type { RecurringTransaction } from '../../types'

export class LocalRecurringRepo implements IRecurringRepository {
  private dispatch: React.Dispatch<AppAction>

  constructor(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch
  }

  async create(
    data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringTransaction> {
    this.dispatch({ type: 'ADD_RECURRING', recurring: data })
    return { ...data, id: 0, createdAt: '', updatedAt: '' }
  }

  async update(id: number, data: Partial<RecurringTransaction>): Promise<void> {
    this.dispatch({ type: 'UPDATE_RECURRING', id, updates: data })
  }

  async delete(id: number): Promise<void> {
    this.dispatch({ type: 'DELETE_RECURRING', id })
  }
}
