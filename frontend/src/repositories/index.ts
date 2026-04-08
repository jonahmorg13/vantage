import type React from 'react'
import type { AppAction } from '../context/appReducer'
import type { Repositories } from './types'
import { ApiClient } from './api/ApiClient'
import { ApiTransactionRepo } from './api/ApiTransactionRepo'
import { ApiAccountRepo } from './api/ApiAccountRepo'
import { ApiCategoryRepo } from './api/ApiCategoryRepo'
import { ApiRecurringRepo } from './api/ApiRecurringRepo'
import { ApiSettingsRepo } from './api/ApiSettingsRepo'
import { ApiMonthRepo } from './api/ApiMonthRepo'

export function createRepositories(dispatch: React.Dispatch<AppAction>): Repositories {
  const client = new ApiClient()
  return {
    transactions: new ApiTransactionRepo(client, dispatch),
    accounts: new ApiAccountRepo(client, dispatch),
    categories: new ApiCategoryRepo(client, dispatch),
    recurring: new ApiRecurringRepo(client, dispatch),
    settings: new ApiSettingsRepo(client, dispatch),
    months: new ApiMonthRepo(client, dispatch),
    apiClient: client,
  }
}
