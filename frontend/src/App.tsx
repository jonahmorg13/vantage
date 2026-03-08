import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AccountsPage } from './pages/AccountsPage'
import { FuturePage } from './pages/FuturePage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
