import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { ISettingsRepository } from '../types'
import type { CategoryTemplate } from '../../types'
import type { ApiClient } from './ApiClient'

export class ApiSettingsRepo implements ISettingsRepository {
  private client: ApiClient
  private dispatch: React.Dispatch<AppAction>

  constructor(client: ApiClient, dispatch: React.Dispatch<AppAction>) {
    this.client = client
    this.dispatch = dispatch
  }

  async updateIncome(takeHomePay: number): Promise<void> {
    await this.client.put('/settings/income', { defaultTakeHomePay: takeHomePay })
    this.dispatch({ type: 'UPDATE_SETTINGS', defaultTakeHomePay: takeHomePay })
  }

  async createTemplate(data: Omit<CategoryTemplate, 'id'>): Promise<CategoryTemplate> {
    const template = await this.client.post<CategoryTemplate>('/settings/templates', data)
    this.dispatch({ type: 'ADD_TEMPLATE', template })
    return template
  }

  async updateTemplate(id: number, data: Partial<CategoryTemplate>): Promise<void> {
    const template = await this.client.put<CategoryTemplate>(`/settings/templates/${id}`, data)
    this.dispatch({ type: 'UPDATE_TEMPLATE', id, updates: template })
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.client.delete(`/settings/templates/${id}`)
    this.dispatch({ type: 'DELETE_TEMPLATE', id })
  }

  async replaceTemplates(templates: Omit<CategoryTemplate, 'id'>[]): Promise<void> {
    const result = await this.client.put<CategoryTemplate[]>('/settings/templates', templates)
    this.dispatch({ type: 'REPLACE_TEMPLATES', templates: result })
  }

  async updateCurrencySymbol(symbol: string): Promise<void> {
    await this.client.put('/settings/currency', { currencySymbol: symbol })
    this.dispatch({ type: 'UPDATE_SETTINGS', currencySymbol: symbol })
  }
}
