import { useState } from 'react'

const allTransactions = [
  { id: 1, name: 'Whole Foods Market', category: 'Groceries', date: 'May 13, 2026', amount: -67.43, status: 'pending' },
  { id: 2, name: 'Direct Deposit — Target', category: 'Income', date: 'May 12, 2026', amount: 892.00, status: 'settled' },
  { id: 3, name: 'Netflix', category: 'Subscriptions', date: 'May 11, 2026', amount: -17.99, status: 'settled' },
  { id: 4, name: 'Spotify', category: 'Subscriptions', date: 'May 10, 2026', amount: -11.99, status: 'settled' },
  { id: 5, name: 'Zelle — Sara', category: 'Transfer', date: 'May 9, 2026', amount: -50.00, status: 'settled' },
  { id: 6, name: 'Shell Gas Station', category: 'Gas', date: 'May 8, 2026', amount: -48.21, status: 'settled' },
  { id: 7, name: 'Direct Deposit — Target', category: 'Income', date: 'Apr 28, 2026', amount: 892.00, status: 'settled' },
  { id: 8, name: 'Amazon', category: 'Shopping', date: 'Apr 27, 2026', amount: -34.99, status: 'settled' },
  { id: 9, name: 'Chick-fil-A', category: 'Food & Drink', date: 'Apr 26, 2026', amount: -12.43, status: 'settled' },
  { id: 10, name: 'Target', category: 'Shopping', date: 'Apr 25, 2026', amount: -61.17, status: 'settled' },
  { id: 11, name: 'Planet Fitness', category: 'Health', date: 'Apr 24, 2026', amount: -25.00, status: 'settled' },
  { id: 12, name: 'Venmo — Mom', category: 'Transfer', date: 'Apr 23, 2026', amount: 100.00, status: 'settled' },
]

const categoryColors: Record<string, string> = {
  Groceries: '#4a7c6f',
  Income: '#4a7c6f',
  Subscriptions: '#7c6f4a',
  Transfer: '#6f4a7c',
  Gas: '#7c4a4a',
  Shopping: '#4a6f7c',
  'Food & Drink': '#7c7c4a',
  Health: '#4a7c6f',
}

function fmt(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
  return n < 0 ? `-$${abs}` : `+$${abs}`
}

type Filter = 'All' | 'Pending' | 'Income' | 'Expenses'

export default function Transactions() {
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')

  const filtered = allTransactions.filter(tx => {
    const matchesFilter =
      filter === 'All' ? true :
      filter === 'Pending' ? tx.status === 'pending' :
      filter === 'Income' ? tx.amount > 0 :
      tx.amount < 0

    const matchesSearch = tx.name.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const tabs: Filter[] = ['All', 'Pending', 'Income', 'Expenses']

  return (
    <div style={{ padding: '48px 48px 80px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Overview
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '-1px', lineHeight: 1 }}>
            Transactions
          </h1>
        </div>
        <button style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '10px 18px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          marginTop: '8px',
        }}>
          + Add Transaction
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '7px 16px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: filter === tab ? 'var(--accent)' : 'var(--border)',
                background: filter === tab ? 'var(--accent-light)' : 'transparent',
                color: filter === tab ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: filter === tab ? '600' : '400',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No transactions found.
          </div>
        ) : (
          filtered.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(128,128,128,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Category dot */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${categoryColors[tx.category] || '#6b7280'}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  color: categoryColors[tx.category] || '#6b7280',
                  fontWeight: '700',
                  flexShrink: 0,
                }}>
                  {tx.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>{tx.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{tx.date}</span>
                    <span style={{
                      padding: '1px 7px',
                      borderRadius: '999px',
                      background: `${categoryColors[tx.category] || '#6b7280'}18`,
                      color: categoryColors[tx.category] || '#6b7280',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}>
                      {tx.category}
                    </span>
                    {tx.status === 'pending' && (
                      <span style={{ fontSize: '11px', background: 'rgba(217,119,6,0.12)', color: 'var(--pending)', padding: '1px 7px', borderRadius: '999px', fontWeight: '500' }}>
                        pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: tx.amount > 0 ? 'var(--positive)' : 'var(--text)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmt(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Count */}
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
