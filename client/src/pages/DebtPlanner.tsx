import { useEffect, useRef, useState } from 'react'
import { DEBT_TYPES } from '../types'
import type { Debt, DebtType } from '../types'

interface Props {
  debts: Debt[]
  onAddDebt: (debt: Omit<Debt, 'id' | 'paidMonths'>) => void
  onToggleDebtPaid: (debtId: number, month: string) => void
}

type Strategy = 'avalanche' | 'snowball'

function monthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

function fmtRate(r: number) {
  return `${r.toFixed(2)}%`
}

const typeIcons: Record<DebtType, string> = {
  'Credit Card': '💳',
  'Car': '🚗',
  'Mortgage': '🏠',
  'Student Loan': '🎓',
  'Personal Loan': '📋',
}

function simulatePayoff(debts: Debt[], strategy: Strategy): { months: number; totalInterest: number } {
  const active = debts.filter(d => d.balance > 0)
  if (!active.length) return { months: 0, totalInterest: 0 }

  const state = active.map(d => ({
    id: d.id,
    balance: d.balance,
    monthlyRate: d.interestRate / 100 / 12,
    min: d.minimumPayment,
  }))

  const totalMonthly = state.reduce((s, d) => s + d.min, 0)
  let totalInterest = 0
  let months = 0

  while (state.some(d => d.balance > 0) && months < 600) {
    months++

    // Accrue interest on all active debts
    state.forEach(d => {
      if (d.balance > 0) {
        const interest = d.balance * d.monthlyRate
        totalInterest += interest
        d.balance += interest
      }
    })

    // Find focus debt by strategy
    const live = state.filter(d => d.balance > 0)
    live.sort((a, b) => strategy === 'avalanche' ? b.monthlyRate - a.monthlyRate : a.balance - b.balance)

    // Pay minimums to non-focus debts; remainder goes to focus
    let paidNonFocus = 0
    live.slice(1).forEach(d => {
      const payment = Math.min(d.balance, d.min)
      d.balance -= payment
      paidNonFocus += payment
      if (d.balance < 0.01) d.balance = 0
    })

    const focus = live[0]
    if (focus) {
      const payment = Math.min(focus.balance, totalMonthly - paidNonFocus)
      focus.balance -= payment
      if (focus.balance < 0.01) focus.balance = 0
    }
  }

  return { months, totalInterest }
}

function formatPayoffDate(months: number) {
  if (months === 0) return 'Already paid off'
  if (months >= 600) return 'Over 50 years'
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function DebtPlanner({ debts, onAddDebt, onToggleDebtPaid }: Props) {
  const [strategy, setStrategy] = useState<Strategy>('avalanche')
  const [modalOpen, setModalOpen] = useState(false)
  const month = monthKey()

  const { months, totalInterest } = simulatePayoff(debts, strategy)
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)

  // Focus debt: highest rate (avalanche) or lowest balance (snowball)
  const focusDebt = debts.length > 0
    ? [...debts].sort((a, b) =>
        strategy === 'avalanche' ? b.interestRate - a.interestRate : a.balance - b.balance
      )[0]
    : null

  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const totalMonthlyPayment = debts.reduce((s, d) => s + d.minimumPayment, 0)

  return (
    <>
      {modalOpen && (
        <AddDebtModal
          onClose={() => setModalOpen(false)}
          onAdd={debt => { onAddDebt(debt); setModalOpen(false) }}
        />
      )}

      <div style={{ padding: '48px 48px 80px', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Payoff Strategy
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '-1px', lineHeight: 1 }}>
              Debt Planner
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: '8px' }}
          >
            + Add Debt
          </button>
        </div>

        {/* Strategy toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
          {([['avalanche', 'Avalanche', 'Highest rate first'], ['snowball', 'Snowball', 'Smallest balance first']] as const).map(([key, label, sub]) => (
            <button
              key={key}
              onClick={() => setStrategy(key)}
              style={{
                padding: '10px 20px',
                borderRadius: '9px',
                border: 'none',
                background: strategy === key ? 'var(--accent)' : 'transparent',
                color: strategy === key ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{label}</div>
              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '1px' }}>{sub}</div>
            </button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Debt', value: fmt(totalDebt), note: `${debts.length} account${debts.length !== 1 ? 's' : ''}` },
            { label: 'Projected Payoff', value: formatPayoffDate(months), note: months > 0 ? `${months} months` : '' },
            { label: 'Total Interest', value: fmt(totalInterest), note: 'at current minimums' },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '0 24px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: i === 1 ? '16px' : '22px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
                {item.value}
              </div>
              {item.note && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.note}</div>}
            </div>
          ))}
        </div>

        {/* Debt cards */}
        {debts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <p style={{ marginBottom: '8px', fontSize: '32px', opacity: 0.3 }}>◫</p>
            <p>No debts added. Add your debts to start planning your payoff.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {debts.map(debt => {
              const isFocus = debt.id === focusDebt?.id
              const progress = debt.originalBalance > 0
                ? Math.max(0, Math.min(100, ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100))
                : 0
              const progressColor = progress > 70 ? 'var(--positive)' : progress > 30 ? 'var(--pending)' : 'var(--accent)'

              return (
                <div
                  key={debt.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `${isFocus ? '2px' : '1px'} solid ${isFocus ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '16px',
                    padding: '24px 28px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{typeIcons[debt.type]}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '600' }}>{debt.name}</span>
                          {isFocus && (
                            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              Focus
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{debt.type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                        {fmt(debt.balance)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>remaining</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {debt.originalBalance > debt.balance && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ background: 'var(--bg)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: progressColor, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(220,38,38,0.1)', color: 'var(--negative)', fontWeight: '600' }}>
                      {fmtRate(debt.interestRate)} APR
                    </span>
                    <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(128,128,128,0.1)', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {fmt(debt.minimumPayment)}/mo min
                    </span>
                    {debt.originalBalance > 0 && (
                      <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(128,128,128,0.08)', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {progress.toFixed(0)}% paid off
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Monthly payment calendar */}
        {debts.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{monthLabel} Payments</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{fmt(totalMonthlyPayment)}/month total</span>
            </div>
            {debts.map((debt, i) => {
              const isPaid = debt.paidMonths.includes(month)
              return (
                <div
                  key={debt.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 24px',
                    borderBottom: i < debts.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: isPaid ? 0.55 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>{typeIcons[debt.type]}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', textDecoration: isPaid ? 'line-through' : 'none' }}>{debt.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Minimum payment</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>{fmt(debt.minimumPayment)}</span>
                    <button
                      onClick={() => onToggleDebtPaid(debt.id, month)}
                      style={{
                        background: isPaid ? 'var(--positive)' : 'transparent',
                        border: `1px solid ${isPaid ? 'var(--positive)' : 'var(--border)'}`,
                        color: isPaid ? '#fff' : 'var(--text-muted)',
                        borderRadius: '8px',
                        padding: '5px 14px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                        minWidth: '90px',
                      }}
                    >
                      {isPaid ? '✓ Paid' : 'Mark Paid'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ── Add Debt Modal ─────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: 'var(--text-muted)', marginBottom: '6px',
  letterSpacing: '0.06em', textTransform: 'uppercase',
}

function AddDebtModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: Omit<Debt, 'id' | 'paidMonths'>) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<DebtType>('Credit Card')
  const [balance, setBalance] = useState('')
  const [originalBalance, setOriginalBalance] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [minimumPayment, setMinimumPayment] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const bal = parseFloat(balance)
    const origBal = originalBalance.trim() ? parseFloat(originalBalance) : bal
    const rate = parseFloat(interestRate)
    const minPay = parseFloat(minimumPayment)
    if (!name.trim() || isNaN(bal) || isNaN(rate) || isNaN(minPay)) return
    onAdd({ name: name.trim(), type, balance: bal, originalBalance: origBal, interestRate: rate, minimumPayment: minPay })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '-0.5px' }}>Add Debt</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input ref={firstRef} type="text" placeholder="e.g. Amex Gold, Car Loan" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Type</label>
            <select value={type} onChange={e => setType(e.target.value as DebtType)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {DEBT_TYPES.map(t => <option key={t} value={t}>{typeIcons[t]} {t}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Current Balance</label>
              <input type="number" placeholder="0.00" value={balance} onChange={e => setBalance(e.target.value)} min="0" step="0.01" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Original Balance <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(opt.)</span></label>
              <input type="number" placeholder="Defaults to current" value={originalBalance} onChange={e => setOriginalBalance(e.target.value)} min="0" step="0.01" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Interest Rate %</label>
              <input type="number" placeholder="e.g. 24.99" value={interestRate} onChange={e => setInterestRate(e.target.value)} min="0" step="0.01" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Minimum Payment</label>
              <input type="number" placeholder="e.g. 65" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} min="1" step="0.01" required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Add Debt</button>
          </div>
        </form>
      </div>
    </div>
  )
}
