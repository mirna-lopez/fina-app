import { useState } from 'react'
import { parseTransaction } from '../lib/parseTransaction'
import type { NewTransaction } from '../types'

interface Props {
  onAddTransaction: (tx: NewTransaction) => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const INCOME_RE = /\b(deposit|paycheck|salary|refund|reimbursement|received|income|transfer\s+in)\b/i

export default function QuickAdd({ onAddTransaction }: Props) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [toggleType, setToggleType] = useState<'Expense' | 'Income'>('Expense')
  const [toggleManuallySet, setToggleManuallySet] = useState(false)

  const hasIncomeKeywords = INCOME_RE.test(input)
  const effectiveType = toggleManuallySet ? toggleType : (hasIncomeKeywords ? 'Income' : 'Expense')

  function handleToggle(type: 'Expense' | 'Income') {
    setToggleType(type)
    setToggleManuallySet(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const tx = await parseTransaction(input.trim())
      const isIncome = toggleManuallySet ? toggleType === 'Income' : hasIncomeKeywords
      tx.amount = isIncome ? Math.abs(tx.amount) : -Math.abs(tx.amount)
      onAddTransaction(tx)
      setInput('')
      setToggleType('Expense')
      setToggleManuallySet(false)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '12px 16px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--accent)', flexShrink: 0, fontWeight: '600' }}>✦ AI</span>

      <input
        type="text"
        placeholder="e.g. 50 ramen, 17.99 netflix, 892 direct deposit..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={status === 'loading'}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          color: 'var(--text)',
          fontSize: '14px',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          opacity: status === 'loading' ? 0.5 : 1,
          transition: 'opacity 0.15s',
          minWidth: 0,
        }}
      />

      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg)', borderRadius: '8px', padding: '2px', flexShrink: 0 }}>
        {(['Expense', 'Income'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => handleToggle(type)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: effectiveType === type ? 'var(--bg-card)' : 'transparent',
              color: effectiveType === type
                ? (type === 'Expense' ? 'var(--negative)' : 'var(--positive)')
                : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: effectiveType === type ? '600' : '400',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
              boxShadow: effectiveType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>Parsing…</span>
      )}
      {status === 'success' && (
        <span style={{ fontSize: '12px', color: 'var(--positive)', flexShrink: 0, fontWeight: '500' }}>✓ Added</span>
      )}
      {status === 'error' && (
        <span style={{ fontSize: '12px', color: 'var(--negative)', flexShrink: 0 }}>Couldn't parse</span>
      )}
      {status === 'idle' && input.trim() && (
        <button
          type="submit"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            flexShrink: 0,
          }}
        >
          Add
        </button>
      )}
    </form>
  )
}
