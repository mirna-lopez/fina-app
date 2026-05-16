export const CATEGORIES = [
  'Groceries',
  'Food & Drink',
  'Subscriptions',
  'Shopping',
  'Gas',
  'Health',
  'Transfer',
  'Income',
  'Credit Card',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]

export interface Transaction {
  id: number
  name: string
  amount: number
  category: Category
  date: string
  status: 'settled' | 'pending'
  paymentMethod: string | null
}

export type NewTransaction = Omit<Transaction, 'id'>

export interface Card {
  id: number
  name: string
  limit: number
}

// ── Bills ──────────────────────────────────────────────────────────────────

export const BILL_CATEGORIES = [
  'Rent',
  'Utilities',
  'Phone',
  'Internet',
  'Insurance',
  'Subscription',
  'Other',
] as const

export type BillCategory = typeof BILL_CATEGORIES[number]

export interface Bill {
  id: number
  name: string
  amount: number
  dueDay: number
  category: BillCategory
  paidMonths: string[]
}

// ── Debts ──────────────────────────────────────────────────────────────────

export const DEBT_TYPES = [
  'Credit Card',
  'Car',
  'Mortgage',
  'Student Loan',
  'Personal Loan',
] as const

export type DebtType = typeof DEBT_TYPES[number]

export interface Debt {
  id: number
  name: string
  type: DebtType
  balance: number
  originalBalance: number
  interestRate: number
  minimumPayment: number
  paidMonths: string[]
}

// ── Accounts ───────────────────────────────────────────────────────────────

export const ACCOUNT_TYPES = [
  'Checking',
  'Savings',
  'Roth IRA',
  '401k',
  'Brokerage',
  'HSA',
  'Crypto',
  'Other',
] as const

export type AccountType = typeof ACCOUNT_TYPES[number]

export interface Account {
  id: number
  name: string
  type: AccountType
  institution: string | null
  balance: number
  previousBalance: number | null
  annualContribution: number | null
}
