import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Grid3x3,
  Landmark,
  TrendingUp,
  Settings,
  MoreHorizontal,
  LogOut,
} from 'lucide-react'
import { MonthPicker } from './MonthPicker'
import { useCurrentMonth } from '../../hooks/useMonthBudget'
import { useSpentByCategory } from '../../hooks/useTransactions'
import { useCurrency } from '../../hooks/useCurrency'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Grid3x3 },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
]

const overflowItems = [
  { to: '/future-projections', label: 'Future Projections', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const allNavItems = [...navItems, ...overflowItems]

export function Sidebar() {
  const format = useCurrency()
  const month = useCurrentMonth()
  const spentMap = useSpentByCategory()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const totalBudget = month?.categories.reduce((a, c) => a + c.budgetAmount, 0) ?? 0
  const totalSpent = Array.from(spentMap.values()).reduce((a, v) => a + v, 0)
  const remaining = totalBudget - totalSpent

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!moreOpen) return
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  const isOverflowActive = overflowItems.some((item) => location.pathname === item.to)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-surface border-r border-border flex-col shrink-0">
        {/* Logo */}
        <Link
          to="/"
          className="block px-6 py-7 border-b border-border hover:opacity-80 transition-opacity"
        >
          <h1 className="font-sans text-2xl font-extrabold tracking-tight gradient-text">
            Vantage
          </h1>
          <div className="text-text3 text-xs tracking-[0.15em] uppercase mt-1.5">
            Budget Tracking
          </div>
        </Link>

        {/* Month Picker */}
        <div className="py-5 border-b border-border">
          <MonthPicker />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {allNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-6 py-3 text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-accent bg-accent/8 border-r-2 border-accent'
                    : 'text-text2 hover:text-text hover:bg-surface2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="px-6 py-6 border-t border-border">
          <div className="text-xs text-text3 tracking-[0.12em] uppercase mb-3">This Month</div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text3">Spent</span>
            <span className="text-accent2">{format(totalSpent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text3">Left</span>
            <span className={remaining < 0 ? 'text-danger' : 'text-accent3'}>
              {format(remaining)}
            </span>
          </div>
        </div>

        {/* User / Logout */}
        {user && (
          <div className="px-6 py-4 pb-6 border-t border-border">
            <div className="text-xs text-text3 truncate mb-2 font-mono">{user.email}</div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-text2 hover:text-danger transition-colors font-mono cursor-pointer"
            >
              <LogOut size={15} strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex items-stretch">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-center flex-1 py-3 transition-all duration-150 ${
                isActive ? 'text-accent' : 'text-text3 hover:text-text'
              }`
            }
          >
            {({ isActive }) => <item.icon size={24} strokeWidth={isActive ? 2.2 : 1.6} />}
          </NavLink>
        ))}

        {/* More button */}
        <div ref={moreRef} className="flex items-center justify-center flex-1 relative">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex items-center justify-center w-full py-3 transition-all duration-150 ${
              isOverflowActive || moreOpen ? 'text-accent' : 'text-text3'
            }`}
          >
            <MoreHorizontal size={24} strokeWidth={isOverflowActive || moreOpen ? 2.2 : 1.6} />
          </button>

          {/* Overflow popup */}
          {moreOpen && (
            <div className="absolute bottom-full mb-2 right-0 w-44 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
              {overflowItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 text-sm transition-all duration-150 ${
                      isActive
                        ? 'text-accent bg-accent/10'
                        : 'text-text2 hover:text-text hover:bg-surface2'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
              {user && (
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm text-text2 hover:text-danger hover:bg-surface2 transition-all duration-150 w-full border-t border-border cursor-pointer"
                >
                  <LogOut size={17} strokeWidth={1.8} />
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
