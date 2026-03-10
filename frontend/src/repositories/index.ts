import type React from 'react'
import type { AppAction } from '../context/appReducer'
import type { Repositories } from './types'
import { LocalTransactionRepo } from './local/LocalTransactionRepo'
import { LocalAccountRepo } from './local/LocalAccountRepo'
import { LocalCategoryRepo } from './local/LocalCategoryRepo'
import { LocalRecurringRepo } from './local/LocalRecurringRepo'
import { LocalSettingsRepo } from './local/LocalSettingsRepo'
import { LocalMonthRepo } from './local/LocalMonthRepo'
import { ApiClient } from './api/ApiClient'
import { ApiTransactionRepo } from './api/ApiTransactionRepo'
import { ApiAccountRepo } from './api/ApiAccountRepo'
import { ApiCategoryRepo } from './api/ApiCategoryRepo'
import { ApiRecurringRepo } from './api/ApiRecurringRepo'
import { ApiSettingsRepo } from './api/ApiSettingsRepo'
import { ApiMonthRepo } from './api/ApiMonthRepo'

export function createRepositories(dispatch: React.Dispatch<AppAction>): Repositories {
  const dataSource = import.meta.env.VITE_DATA_SOURCE ?? 'api'

  if (dataSource !== 'local') {
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

  return {
    transactions: new LocalTransactionRepo(dispatch),
    accounts: new LocalAccountRepo(dispatch),
    categories: new LocalCategoryRepo(dispatch),
    recurring: new LocalRecurringRepo(dispatch),
    settings: new LocalSettingsRepo(dispatch),
    months: new LocalMonthRepo(dispatch),
  }
}
