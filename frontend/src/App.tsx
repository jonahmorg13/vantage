import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { RepositoryProvider } from './repositories/RepositoryContext'
import { ToastProvider } from './components/ui/Toast'
import { RequireAuth } from './components/auth/RequireAuth'
import { AuthLayout } from './components/auth/AuthLayout'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AccountsPage } from './pages/AccountsPage'
import { FuturePage } from './pages/FuturePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-12 md:py-10 min-w-0 pb-24 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <SkeletonTheme baseColor="#1a1a2e" highlightColor="#252538">
      <AppProvider>
        <AuthProvider>
          <RepositoryProvider>
            <BrowserRouter>
              <ToastProvider>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <AuthLayout>
                        <LoginPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <AuthLayout>
                        <RegisterPage />
                      </AuthLayout>
                    }
                  />
                  <Route
                    element={
                      <RequireAuth>
                        <AppLayout />
                      </RequireAuth>
                    }
                  >
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/budget" element={<CategoriesPage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/future-projections" element={<FuturePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Routes>
              </ToastProvider>
            </BrowserRouter>
          </RepositoryProvider>
        </AuthProvider>
      </AppProvider>
    </SkeletonTheme>
  )
}

export default App
