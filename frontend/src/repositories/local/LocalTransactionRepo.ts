import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { ITransactionRepository, TransactionFilters } from '../types'
import type { Transaction } from '../../types'

export class LocalTransactionRepo implements ITransactionRepository {
  private dispatch: React.Dispatch<AppAction>

  constructor(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAll(_filters?: TransactionFilters): Promise<Transaction[]> {
    return []
  }

  async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    this.dispatch({ type: 'ADD_TRANSACTION', transaction: data })
    return { ...data, id: 0, createdAt: '', updatedAt: '' }
  }

  async update(id: number, data: Partial<Transaction>): Promise<Transaction> {
    this.dispatch({ type: 'UPDATE_TRANSACTION', id, updates: data })
    return { id } as Transaction
  }

  async delete(id: number): Promise<void> {
    this.dispatch({ type: 'DELETE_TRANSACTION', id })
  }

  async confirm(id: number): Promise<void> {
    this.dispatch({ type: 'CONFIRM_TRANSACTION', id })
  }

  async dismiss(id: number): Promise<void> {
    this.dispatch({ type: 'DISMISS_TRANSACTION', id })
  }
}
