import { useAppContext } from '../context/AppContext'
import { formatCurrency } from '../utils/format'

export function useCurrency(): (n: number) => string {
  const { state } = useAppContext()
  const symbol = state.settings.currencySymbol ?? '$'
  return (n: number) => formatCurrency(n, symbol)
}
