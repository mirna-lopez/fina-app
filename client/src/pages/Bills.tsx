import { useEffect, useRef, useState } from 'react'
import { BILL_CATEGORIES } from '../types'
import type { Bill, BillCategory } from '../types'

interface Props {
  bills: Bill[]
  onAddBill: (bill: Omit<Bill, 'id' | 'paidMonths'>) => void
  onToggleBillPaid: (billId: number, month: string) => void
}

function monthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function ordinal(n: number) {
  const j = n % 10, k = n % 100
  if (j === 1 && k !== 11) return `${n}st`
  if (j === 2 && k !== 12) return `${n}nd`
  if (j === 3 && k !== 13) return `${n}rd`
  return `${n}th`
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

const categoryColors: Record<BillCategory, string> = {
  Rent: '#4a7c6f',
  Utilities: '#7c6f4a',
  Phone: '#4a6f7c',
  Internet: '#4a6f7c',
  Insurance: '#6f4a7c',
  Subscription: '#7c7c4a',
  Other: '#6b7280',
}

export default function Bills({ bills, onAddBill, onToggleBillPaid }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const month = monthKey()
  const sorted = [...bills].sort((a, b) => a.dueDay - b.dueDay)

  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0)
  const paidBills = bills.filter(b => b.paidMonths.includes(month))
  const totalPaid = paidBills.reduce((s, b) => s + b.amount, 0)
  const remaining = totalMonthly - totalPaid

  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      {modalOpen && (
        <AddBillModal
          onClose={() => setModalOpen(false)}
          onAdd={bill => { onAddBill(bill); setModalOpen(false) }}
        />
      )}

      <div style={{ padding: '48px 48px 80px', maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {monthLabel}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '-1px', lineHeight: 1 }}>
              Bills
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: '8px' }}
          >
            + Add Bill
          </button>
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Monthly Total', value: totalMonthly, note: `${bills.length} bill${bills.length !== 1 ? 's' : ''}` },
            { label: 'Paid This Month', value: totalPaid, note: `${paidBills.length} of ${bills.length}` },
            { label: 'Remaining', value: remaining, note: remaining === 0 && bills.length > 0 ? 'All clear ✓' : 'left to pay' },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '0 24px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: i === 2 && remaining === 0 && bills.length > 0 ? 'var(--positive)' : 'var(--text)' }}>
                {fmt(item.value)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.note}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {bills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <p style={{ marginBottom: '8px', fontSize: '32px', opacity: 0.3 }}>◷</p>
            <p>No bills yet. Add your recurring bills to track them here.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            {sorted.map((bill, i) => {
              const isPaid = bill.paidMonths.includes(month)
              const color = categoryColors[bill.category]
              return (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: isPaid ? 0.55 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: `${color}18`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '13px', color, fontWeight: '700', flexShrink: 0,
                    }}>
                      {bill.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px', textDecoration: isPaid ? 'line-through' : 'none' }}>
                        {bill.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Due {ordinal(bill.dueDay)}</span>
                        <span style={{ padding: '1px 7px', borderRadius: '999px', background: `${color}18`, color, fontSize: '11px', fontWeight: '500' }}>
                          {bill.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(bill.amount)}
                    </span>
                    <button
                      onClick={() => onToggleBillPaid(bill.id, month)}
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

// ── Modal ──────────────────────────────────────────────────────────────────

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

function AddBillModal({ onClose, onAdd }: { onClose: () => void; onAdd: (b: Omit<Bill, 'id' | 'paidMonths'>) => void }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [category, setCategory] = useState<BillCategory>('Rent')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    const day = parseInt(dueDay, 10)
    if (!name.trim() || isNaN(amt) || day < 1 || day > 31) return
    onAdd({ name: name.trim(), amount: amt, dueDay: day, category })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '-0.5px' }}>Add Bill</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input ref={firstRef} type="text" placeholder="e.g. Netflix, Rent" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Amount</label>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Due Day</label>
              <input type="number" placeholder="1–31" value={dueDay} onChange={e => setDueDay(e.target.value)} min="1" max="31" required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as BillCategory)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {BILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Add Bill</button>
          </div>
        </form>
      </div>
    </div>
  )
}
