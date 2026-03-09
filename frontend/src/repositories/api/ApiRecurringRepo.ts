import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IRecurringRepository } from '../types'
import type { RecurringTransaction } from '../../types'
import type { ApiClient } from './ApiClient'

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
    const recurring = await this.client.post<RecurringTransaction>('/recurring', data)
    this.dispatch({ type: 'ADD_RECURRING', recurring })
    return recurring
  }

  async update(id: number, data: Partial<RecurringTransaction>): Promise<void> {
    const recurring = await this.client.put<RecurringTransaction>(`/recurring/${id}`, data)
    this.dispatch({ type: 'UPDATE_RECURRING', id, updates: recurring })
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/recurring/${id}`)
    this.dispatch({ type: 'DELETE_RECURRING', id })
  }
}
