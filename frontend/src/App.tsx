import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { AppProvider } from './context/AppContext'
import { RepositoryProvider } from './repositories/RepositoryContext'
import { ToastProvider } from './components/ui/Toast'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AccountsPage } from './pages/AccountsPage'
import { FuturePage } from './pages/FuturePage'

function App() {
  return (
    <SkeletonTheme baseColor="#1a1a2e" highlightColor="#252538">
      <AppProvider>
        <RepositoryProvider>
          <BrowserRouter>
            <ToastProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 px-4 py-6 md:px-12 md:py-10 min-w-0 pb-20 md:pb-10">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/future" element={<FuturePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
              </div>
            </ToastProvider>
          </BrowserRouter>
        </RepositoryProvider>
      </AppProvider>
    </SkeletonTheme>
  )
}

export default App
