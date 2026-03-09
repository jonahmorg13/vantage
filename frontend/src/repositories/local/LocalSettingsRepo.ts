import type React from 'react'
import type { AppAction } from '../../context/appReducer'
import type { ISettingsRepository } from '../types'
import type { CategoryTemplate } from '../../types'

export class LocalSettingsRepo implements ISettingsRepository {
  private dispatch: React.Dispatch<AppAction>

  constructor(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch
  }

  async updateIncome(takeHomePay: number): Promise<void> {
    this.dispatch({ type: 'UPDATE_SETTINGS', defaultTakeHomePay: takeHomePay })
  }

  async updateCurrencySymbol(symbol: string): Promise<void> {
    this.dispatch({ type: 'UPDATE_SETTINGS', currencySymbol: symbol })
  }

  async createTemplate(data: Omit<CategoryTemplate, 'id'>): Promise<CategoryTemplate> {
    this.dispatch({ type: 'ADD_TEMPLATE', template: data })
    return { ...data, id: 0 }
  }

  async updateTemplate(id: number, data: Partial<CategoryTemplate>): Promise<void> {
    this.dispatch({ type: 'UPDATE_TEMPLATE', id, updates: data })
  }

  async deleteTemplate(id: number): Promise<void> {
    this.dispatch({ type: 'DELETE_TEMPLATE', id })
  }

  async replaceTemplates(templates: Omit<CategoryTemplate, 'id'>[]): Promise<void> {
    this.dispatch({ type: 'REPLACE_TEMPLATES', templates })
  }
}
