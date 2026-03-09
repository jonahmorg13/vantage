import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IAccountRepository } from '../types'
import type { Account } from '../../types'
import type { ApiClient } from './ApiClient'

export class ApiAccountRepo implements IAccountRepository {
  private client: ApiClient
  private dispatch: React.Dispatch<AppAction>

  constructor(client: ApiClient, dispatch: React.Dispatch<AppAction>) {
    this.client = client
    this.dispatch = dispatch
  }

  async create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const account = await this.client.post<Account>('/accounts', data)
    this.dispatch({ type: 'ADD_ACCOUNT', account })
    return account
  }

  async update(id: number, data: Partial<Account>): Promise<void> {
    const account = await this.client.put<Account>(`/accounts/${id}`, data)
    this.dispatch({ type: 'UPDATE_ACCOUNT', id, updates: account })
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/accounts/${id}`)
    this.dispatch({ type: 'DELETE_ACCOUNT', id })
  }
}
