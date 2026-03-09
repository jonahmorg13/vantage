import { useAppContext } from '../../context/AppContext'
import {
  formatMonthDisplay,
  prevMonthKey,
  nextMonthKey,
  getCurrentMonthKey,
} from '../../utils/format'

export function MonthPicker() {
  const { state, dispatch } = useAppContext()
  const { currentMonthKey } = state
  const isCurrentMonth = currentMonthKey === getCurrentMonthKey()

  function navigate(direction: 'prev' | 'next') {
    const newKey =
      direction === 'prev' ? prevMonthKey(currentMonthKey) : nextMonthKey(currentMonthKey)
    dispatch({ type: 'SET_MONTH', monthKey: newKey })
  }

  return (
    <div className="flex items-center gap-3 px-4">
      <button
        onClick={() => navigate('prev')}
        className="text-text3 hover:text-accent transition-colors p-1.5 rounded hover:bg-surface3 text-base"
      >
        ◀
      </button>
      <div className="flex-1 text-center text-sm text-text2 font-medium">
        {formatMonthDisplay(currentMonthKey)}
      </div>
      <button
        onClick={() => navigate('next')}
        disabled={isCurrentMonth}
        className={`transition-colors p-1.5 rounded text-base ${
          isCurrentMonth
            ? 'text-text3/30 cursor-not-allowed'
            : 'text-text3 hover:text-accent hover:bg-surface3'
        }`}
      >
        ▶
      </button>
    </div>
  )
}
