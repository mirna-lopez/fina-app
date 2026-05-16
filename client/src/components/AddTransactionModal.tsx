import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../types'
import { parseTransaction } from '../lib/parseTransaction'
import type { NewTransaction, Category } from '../types'

interface Props {
  onClose: () => void
  onAddTransaction: (tx: NewTransaction) => void
}

const categoryColors: Record<string, string> = {
  Groceries: '#4a7c6f',
  Income: '#4a7c6f',
  Subscriptions: '#7c6f4a',
  Transfer: '#6f4a7c',
  Gas: '#7c4a4a',
  Shopping: '#4a6f7c',
  'Food & Drink': '#7c7c4a',
  Health: '#4a7c6f',
  'Credit Card': '#4a6f7c',
  Other: '#6b7280',
}

const INCOME_RE = /\b(deposit|paycheck|salary|refund|reimbursement|received|income|transfer\s+in)\b/i

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtAmount(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
  return n < 0 ? `-$${abs}` : `+$${abs}`
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

export default function AddTransactionModal({ onClose, onAddTransaction }: Props) {
  const [tab, setTab] = useState<'quick' | 'manual'>('quick')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '-0.5px' }}>
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
          {(['quick', 'manual'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: tab === t ? 'var(--bg-card)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: tab === t ? '600' : '400',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t === 'quick' ? '✦ Quick (AI)' : 'Manual'}
            </button>
          ))}
        </div>

        {tab === 'quick'
          ? <QuickTab onAdd={onAddTransaction} onClose={onClose} />
          : <ManualTab onAdd={onAddTransaction} onClose={onClose} />
        }
      </div>
    </div>
  )
}

function QuickTab({ onAdd, onClose }: { onAdd: (tx: NewTransaction) => void; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [preview, setPreview] = useState<NewTransaction | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleParse(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || status === 'loading') return
    setStatus('loading')
    setPreview(null)
    try {
      const tx = await parseTransaction(input.trim())
      const isIncome = INCOME_RE.test(input)
      tx.amount = isIncome ? Math.abs(tx.amount) : -Math.abs(tx.amount)
      setPreview(tx)
      setStatus('idle')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  function handleConfirm() {
    if (!preview) return
    onAdd(preview)
    onClose()
  }

  const color = preview ? (categoryColors[preview.category] || '#6b7280') : 'var(--accent)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <form onSubmit={handleParse} style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. 17.99 netflix, 892 direct deposit..."
          value={input}
          onChange={e => { setInput(e.target.value); setPreview(null) }}
          disabled={status === 'loading'}
          style={{ ...inputStyle, flex: 1, opacity: status === 'loading' ? 0.6 : 1 }}
        />
        <button
          type="submit"
          disabled={!input.trim() || status === 'loading'}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: input.trim() && status !== 'loading' ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-body)',
            opacity: !input.trim() || status === 'loading' ? 0.5 : 1,
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
        >
          {status === 'loading' ? 'Parsing…' : 'Parse'}
        </button>
      </form>

      {status === 'error' && (
        <p style={{ fontSize: '13px', color: 'var(--negative)', textAlign: 'center' }}>
          Couldn't parse — try rephrasing.
        </p>
      )}

      {preview && (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Preview</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{preview.name}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: `${color}18`, color, fontWeight: '500', whiteSpace: 'nowrap' }}>
                  {preview.category}
                </span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(128,128,128,0.1)', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                  {preview.date}
                </span>
                {preview.paymentMethod && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(128,128,128,0.1)', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    {preview.paymentMethod}
                  </span>
                )}
                {preview.status === 'pending' && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(217,119,6,0.12)', color: 'var(--pending)', fontWeight: '500' }}>
                    pending
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: preview.amount > 0 ? 'var(--positive)' : 'var(--text)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {fmtAmount(preview.amount)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => setPreview(null)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Edit
            </button>
            <button
              onClick={handleConfirm}
              style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Confirm & Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ManualTab({ onAdd, onClose }: { onAdd: (tx: NewTransaction) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('Groceries')
  const [date, setDate] = useState(todayISO())
  const [status, setStatus] = useState<'settled' | 'pending'>('settled')
  const [paymentMethod, setPaymentMethod] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!name.trim() || isNaN(parsed)) return
    onAdd({
      name: name.trim(),
      amount: parsed,
      category,
      date: isoToDisplay(date),
      status,
      paymentMethod: paymentMethod.trim() || null,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <label style={labelStyle}>Name</label>
        <input ref={firstRef} type="text" placeholder="e.g. Netflix" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Amount</label>
        <input
          type="number"
          placeholder="-12.99 for expense · 500 for income"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          step="0.01"
          required
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as Category)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Payment Method <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. Amex Gold, Chase, Zelle"
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['settled', 'pending'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: status === s ? 'var(--accent)' : 'var(--border)',
                background: status === s ? 'var(--accent-light)' : 'transparent',
                color: status === s ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: status === s ? '600' : '400',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >
          Add Transaction
        </button>
      </div>
    </form>
  )
}
