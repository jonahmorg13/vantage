import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { IAccountRepository } from '../types'
import type { Account } from '../../types'

export class LocalAccountRepo implements IAccountRepository {
  private dispatch: React.Dispatch<AppAction>

  constructor(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch
  }

  async create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    this.dispatch({ type: 'ADD_ACCOUNT', account: data })
    return { ...data, id: 0, createdAt: '', updatedAt: '' }
  }

  async update(id: number, data: Partial<Account>): Promise<void> {
    this.dispatch({ type: 'UPDATE_ACCOUNT', id, updates: data })
  }

  async delete(id: number): Promise<void> {
    this.dispatch({ type: 'DELETE_ACCOUNT', id })
  }
}
