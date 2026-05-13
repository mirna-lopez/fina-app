import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'

const pages: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard />,
  Transactions: <Transactions />,
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {pages[activePage] ?? <Dashboard />}
    </AppShell>
  )
}

export default App
