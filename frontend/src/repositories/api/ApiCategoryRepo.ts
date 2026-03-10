import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { ICategoryRepository } from '../types'
import type { Category } from '../../types'
import type { ApiClient } from './ApiClient'

export class ApiCategoryRepo implements ICategoryRepository {
  private client: ApiClient
  private dispatch: React.Dispatch<AppAction>

  constructor(client: ApiClient, dispatch: React.Dispatch<AppAction>) {
    this.client = client
    this.dispatch = dispatch
  }

  async create(monthKey: string, data: Omit<Category, 'id'>): Promise<Category> {
    const category = await this.client.post<Category>(`/api/months/${monthKey}/categories`, data)
    this.dispatch({ type: 'ADD_CATEGORY', monthKey, category })
    return category
  }

  async update(monthKey: string, id: number, data: Partial<Category>): Promise<void> {
    const category = await this.client.put<Category>(`/api/months/${monthKey}/categories/${id}`, data)
    this.dispatch({ type: 'UPDATE_CATEGORY', monthKey, id, updates: category })
  }

  async delete(monthKey: string, id: number): Promise<void> {
    await this.client.delete(`/api/months/${monthKey}/categories/${id}`)
    this.dispatch({ type: 'DELETE_CATEGORY', monthKey, id })
  }
}
