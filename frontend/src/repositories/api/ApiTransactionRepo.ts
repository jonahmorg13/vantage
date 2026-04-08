import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { ITransactionRepository, TransactionFilters } from '../types'
import type { Transaction, Account } from '../../types'
import type { ApiClient } from './ApiClient'

export class ApiTransactionRepo implements ITransactionRepository {
  private client: ApiClient
  private dispatch: React.Dispatch<AppAction>

  constructor(client: ApiClient, dispatch: React.Dispatch<AppAction>) {
    this.client = client
    this.dispatch = dispatch
  }

  private async refreshAccounts(): Promise<void> {
    try {
      const accounts = await this.client.get<Account[]>('/api/accounts')
      this.dispatch({ type: 'SET_ACCOUNTS', accounts })
    } catch {
      // ignore
    }
  }

  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams()
    if (filters?.monthKey) params.set('monthKey', filters.monthKey)
    if (filters?.categoryId != null) params.set('categoryId', String(filters.categoryId))
    if (filters?.type) params.set('type', filters.type)
    if (filters?.status) params.set('status', filters.status)
    if (filters?.search) params.set('search', filters.search)
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.set('dateTo', filters.dateTo)
    const qs = params.toString()
    return this.client.get<Transaction[]>(`/api/transactions${qs ? `?${qs}` : ''}`)
  }

  async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const tx = await this.client.post<Transaction>('/api/transactions', data)
    this.dispatch({ type: 'ADD_TRANSACTION', transaction: tx })
    await this.refreshAccounts()
    return tx
  }

  async update(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const tx = await this.client.put<Transaction>(`/api/transactions/${id}`, data)
    this.dispatch({ type: 'UPDATE_TRANSACTION', id, updates: tx })
    await this.refreshAccounts()
    return tx
  }

  async delete(id: number): Promise<void> {
    await this.client.delete(`/api/transactions/${id}`)
    this.dispatch({ type: 'DELETE_TRANSACTION', id })
    await this.refreshAccounts()
  }

  async confirm(id: number): Promise<void> {
    await this.client.post(`/api/transactions/${id}/confirm`)
    this.dispatch({ type: 'CONFIRM_TRANSACTION', id })
    await this.refreshAccounts()
  }

  async dismiss(id: number): Promise<void> {
    await this.client.delete(`/api/transactions/${id}/dismiss`)
    this.dispatch({ type: 'DISMISS_TRANSACTION', id })
    await this.refreshAccounts()
  }
}
