import { useState } from 'react'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Cards from './pages/Cards'
import Bills from './pages/Bills'
import DebtPlanner from './pages/DebtPlanner'
import Accounts from './pages/Accounts'
import type { Transaction, NewTransaction, Card, Bill, Debt, Account } from './types'

const initialTransactions: Transaction[] = [
  { id: 1,  name: 'Whole Foods Market',      category: 'Groceries',     date: 'May 13, 2026', amount:  -67.43, status: 'pending', paymentMethod: 'Amex Gold'  },
  { id: 2,  name: 'Direct Deposit — Target', category: 'Income',        date: 'May 12, 2026', amount:  892.00, status: 'settled', paymentMethod: null          },
  { id: 3,  name: 'Netflix',                 category: 'Subscriptions', date: 'May 11, 2026', amount:  -17.99, status: 'settled', paymentMethod: 'Chase'       },
  { id: 4,  name: 'Spotify',                 category: 'Subscriptions', date: 'May 10, 2026', amount:  -11.99, status: 'settled', paymentMethod: null          },
  { id: 5,  name: 'Zelle — Sara',            category: 'Transfer',      date: 'May 9, 2026',  amount:  -50.00, status: 'settled', paymentMethod: 'Zelle'       },
  { id: 6,  name: 'Shell Gas Station',       category: 'Gas',           date: 'May 8, 2026',  amount:  -48.21, status: 'settled', paymentMethod: 'Amex Gold'  },
  { id: 7,  name: 'Direct Deposit — Target', category: 'Income',        date: 'Apr 28, 2026', amount:  892.00, status: 'settled', paymentMethod: null          },
  { id: 8,  name: 'Amazon',                  category: 'Shopping',      date: 'Apr 27, 2026', amount:  -34.99, status: 'settled', paymentMethod: 'Chase'       },
  { id: 9,  name: 'Chick-fil-A',             category: 'Food & Drink',  date: 'Apr 26, 2026', amount:  -12.43, status: 'settled', paymentMethod: 'Amex Gold'  },
  { id: 10, name: 'Target',                  category: 'Shopping',      date: 'Apr 25, 2026', amount:  -61.17, status: 'settled', paymentMethod: null          },
  { id: 11, name: 'Planet Fitness',          category: 'Health',        date: 'Apr 24, 2026', amount:  -25.00, status: 'settled', paymentMethod: 'Chase'       },
  { id: 12, name: 'Venmo — Mom',             category: 'Transfer',      date: 'Apr 23, 2026', amount:  100.00, status: 'settled', paymentMethod: null          },
]

const initialCards: Card[] = [
  { id: 1, name: 'Amex Gold', limit: 5000 },
  { id: 2, name: 'Chase',     limit: 3000 },
]

const initialBills: Bill[] = [
  { id: 1, name: 'Rent',     amount: 450, dueDay: 1,  category: 'Rent',         paidMonths: ['2026-04', '2026-05'] },
  { id: 2, name: 'Electric', amount: 89,  dueDay: 18, category: 'Utilities',    paidMonths: ['2026-04'] },
  { id: 3, name: 'Phone',    amount: 81,  dueDay: 22, category: 'Phone',        paidMonths: ['2026-04'] },
  { id: 4, name: 'Spotify',  amount: 12,  dueDay: 10, category: 'Subscription', paidMonths: ['2026-04', '2026-05'] },
]

const initialDebts: Debt[] = [
  { id: 1, name: 'Amex Gold',    type: 'Credit Card',  balance: 2340,  originalBalance: 3500,  interestRate: 24.99, minimumPayment: 65,  paidMonths: [] },
  { id: 2, name: 'Car Loan',     type: 'Car',          balance: 12500, originalBalance: 18000, interestRate: 6.5,   minimumPayment: 350, paidMonths: [] },
  { id: 3, name: 'Student Loan', type: 'Student Loan', balance: 8200,  originalBalance: 27000, interestRate: 4.5,   minimumPayment: 180, paidMonths: [] },
]

const initialAccounts: Account[] = [
  { id: 1, name: 'Main Checking',      type: 'Checking',  institution: 'Chase',    balance: 3240.50, previousBalance: 2890.00, annualContribution: null },
  { id: 2, name: 'High-Yield Savings', type: 'Savings',   institution: 'Ally',     balance: 8500.00, previousBalance: 8100.00, annualContribution: null },
  { id: 3, name: 'Roth IRA',           type: 'Roth IRA',  institution: 'Fidelity', balance: 18200.00, previousBalance: 17800.00, annualContribution: 2500 },
  { id: 4, name: '401k',               type: '401k',      institution: 'Vanguard', balance: 24600.00, previousBalance: 23900.00, annualContribution: 8750 },
  { id: 5, name: 'Brokerage',          type: 'Brokerage', institution: 'Robinhood', balance: 4200.00, previousBalance: 3950.00, annualContribution: null },
]

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [debts, setDebts] = useState<Debt[]>(initialDebts)
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)

  function onAddTransaction(tx: NewTransaction) {
    setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev])
  }

  function onAddCard(card: Omit<Card, 'id'>) {
    setCards(prev => [...prev, { ...card, id: Date.now() }])
  }

  function onAddBill(bill: Omit<Bill, 'id' | 'paidMonths'>) {
    setBills(prev => [...prev, { ...bill, id: Date.now(), paidMonths: [] }])
  }

  function onToggleBillPaid(billId: number, month: string) {
    setBills(prev => prev.map(b => {
      if (b.id !== billId) return b
      const isPaid = b.paidMonths.includes(month)
      return { ...b, paidMonths: isPaid ? b.paidMonths.filter(m => m !== month) : [...b.paidMonths, month] }
    }))
  }

  function onAddDebt(debt: Omit<Debt, 'id' | 'paidMonths'>) {
    setDebts(prev => [...prev, { ...debt, id: Date.now(), paidMonths: [] }])
  }

  function onToggleDebtPaid(debtId: number, month: string) {
    setDebts(prev => prev.map(d => {
      if (d.id !== debtId) return d
      const isPaid = d.paidMonths.includes(month)
      return { ...d, paidMonths: isPaid ? d.paidMonths.filter(m => m !== month) : [...d.paidMonths, month] }
    }))
  }

  function onAddAccount(account: Omit<Account, 'id'>) {
    setAccounts(prev => [...prev, { ...account, id: Date.now() }])
  }

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'Transactions'
        ? <Transactions transactions={transactions} onAddTransaction={onAddTransaction} />
        : activePage === 'Cards'
        ? <Cards transactions={transactions} cards={cards} onAddCard={onAddCard} />
        : activePage === 'Bills'
        ? <Bills bills={bills} onAddBill={onAddBill} onToggleBillPaid={onToggleBillPaid} />
        : activePage === 'Debt Planner'
        ? <DebtPlanner debts={debts} onAddDebt={onAddDebt} onToggleDebtPaid={onToggleDebtPaid} />
        : activePage === 'Accounts'
        ? <Accounts accounts={accounts} debts={debts} onAddAccount={onAddAccount} />
        : <Dashboard transactions={transactions} accounts={accounts} onAddTransaction={onAddTransaction} />
      }
    </AppShell>
  )
}

export default App
