import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { ICategoryRepository } from '../types'
import type { Category } from '../../types'

export class LocalCategoryRepo implements ICategoryRepository {
  private dispatch: React.Dispatch<AppAction>

  constructor(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch
  }

  async create(monthKey: string, data: Omit<Category, 'id'>): Promise<Category> {
    this.dispatch({ type: 'ADD_CATEGORY', monthKey, category: data })
    return { ...data, id: 0 }
  }

  async update(monthKey: string, id: number, data: Partial<Category>): Promise<void> {
    this.dispatch({ type: 'UPDATE_CATEGORY', monthKey, id, updates: data })
  }

  async delete(monthKey: string, id: number): Promise<void> {
    this.dispatch({ type: 'DELETE_CATEGORY', monthKey, id })
  }
}
