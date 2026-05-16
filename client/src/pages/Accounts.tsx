import { useEffect, useRef, useState } from 'react'
import { ACCOUNT_TYPES } from '../types'
import type { Account, AccountType, Debt } from '../types'

interface Props {
  accounts: Account[]
  debts: Debt[]
  onAddAccount: (account: Omit<Account, 'id'>) => void
}

const ACCOUNT_GROUPS: { label: string; types: AccountType[] }[] = [
  { label: 'Cash & Bank',  types: ['Checking', 'Savings'] },
  { label: 'Retirement',   types: ['Roth IRA', '401k'] },
  { label: 'Investments',  types: ['Brokerage', 'HSA', 'Crypto'] },
  { label: 'Other',        types: ['Other'] },
]

const CONTRIBUTION_LIMITS: Partial<Record<AccountType, number>> = {
  'Roth IRA': 7000,
  '401k': 23500,
}

const typeColors: Record<AccountType, string> = {
  'Checking':     '#4a7c6f',
  'Savings':      '#4a7c6f',
  'Roth IRA':     '#6f4a7c',
  '401k':         '#6f4a7c',
  'Brokerage':    '#4a6f7c',
  'HSA':          '#4a7c6f',
  'Crypto':       '#7c6f4a',
  'Other':        '#6b7280',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export default function Accounts({ accounts, debts, onAddAccount }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const totalAssets = accounts.reduce((s, a) => s + a.balance, 0)
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const netWorth = totalAssets - totalDebt

  return (
    <>
      {modalOpen && (
        <AddAccountModal
          onClose={() => setModalOpen(false)}
          onAdd={acc => { onAddAccount(acc); setModalOpen(false) }}
        />
      )}

      <div style={{ padding: '48px 48px 80px', maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Net Worth
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '-1px', lineHeight: 1 }}>
              Accounts
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: '8px' }}
          >
            + Add Account
          </button>
        </div>

        {/* Net worth summary */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Assets', value: totalAssets, color: 'var(--text)' },
            { label: 'Total Debt',   value: totalDebt,   color: 'var(--negative)' },
            { label: 'Net Worth',    value: netWorth,    color: netWorth >= 0 ? 'var(--positive)' : 'var(--negative)' },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '0 24px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: item.color }}>
                {fmt(item.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {accounts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <p style={{ marginBottom: '8px', fontSize: '32px', opacity: 0.3 }}>◎</p>
            <p>No accounts yet. Add your accounts to track your full financial picture.</p>
          </div>
        )}

        {/* Grouped sections */}
        {ACCOUNT_GROUPS.map(group => {
          const groupAccounts = accounts.filter(a => group.types.includes(a.type))
          if (groupAccounts.length === 0) return null
          return (
            <div key={group.label} style={{ marginBottom: '36px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
                {group.label}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {groupAccounts.map(account => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function AccountCard({ account }: { account: Account }) {
  const limit = CONTRIBUTION_LIMITS[account.type] ?? null
  const hasContribution = limit !== null && account.annualContribution !== null
  const pct = hasContribution ? Math.min((account.annualContribution! / limit!) * 100, 100) : 0
  const barColor = pct >= 100 ? 'var(--positive)' : pct >= 90 ? 'var(--pending)' : 'var(--accent)'

  const change = account.previousBalance !== null ? account.balance - account.previousBalance : null
  const color = typeColors[account.type]

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ minWidth: 0, marginRight: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {account.name}
          </div>
          {account.institution && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{account.institution}</div>
          )}
        </div>
        <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '999px', background: `${color}18`, color, fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {account.type}
        </span>
      </div>

      {/* Balance + MoM change */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: hasContribution ? '18px' : '0' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {account.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
        </div>
        {change !== null && (
          <div style={{ fontSize: '13px', fontWeight: '500', color: change >= 0 ? 'var(--positive)' : 'var(--negative)', textAlign: 'right' }}>
            {change >= 0 ? '+' : ''}{change.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
            <span style={{ marginLeft: '3px' }}>{change >= 0 ? '↑' : '↓'}</span>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '1px' }}>vs last mo.</div>
          </div>
        )}
      </div>

      {/* Contribution progress bar */}
      {hasContribution && (
        <div>
          <div style={{ background: 'var(--bg)', borderRadius: '999px', height: '5px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>${account.annualContribution!.toLocaleString()} contributed</span>
            <span style={{ color: barColor, fontWeight: '500' }}>{pct.toFixed(0)}% of ${limit!.toLocaleString()} limit</span>
          </div>
        </div>
      )}
    </div>
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

function AddAccountModal({ onClose, onAdd }: { onClose: () => void; onAdd: (a: Omit<Account, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('Checking')
  const [institution, setInstitution] = useState('')
  const [balance, setBalance] = useState('')
  const [annualContribution, setAnnualContribution] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  const showContribution = type === 'Roth IRA' || type === '401k'
  const limit = CONTRIBUTION_LIMITS[type]

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const bal = parseFloat(balance)
    if (!name.trim() || isNaN(bal)) return
    onAdd({
      name: name.trim(),
      type,
      institution: institution.trim() || null,
      balance: bal,
      previousBalance: null,
      annualContribution: showContribution && annualContribution.trim()
        ? parseFloat(annualContribution)
        : null,
    })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '-0.5px' }}>Add Account</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Account Name</label>
            <input ref={firstRef} type="text" placeholder="e.g. Main Checking, Roth IRA" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={type} onChange={e => setType(e.target.value as AccountType)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Institution <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(opt.)</span></label>
              <input type="text" placeholder="e.g. Chase, Fidelity" value={institution} onChange={e => setInstitution(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Current Balance</label>
            <input type="number" placeholder="0.00" value={balance} onChange={e => setBalance(e.target.value)} min="0" step="0.01" required style={inputStyle} />
          </div>

          {showContribution && (
            <div>
              <label style={labelStyle}>
                2026 Contributions <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(limit: ${limit!.toLocaleString()})</span>
              </label>
              <input
                type="number"
                placeholder="How much you've contributed this year"
                value={annualContribution}
                onChange={e => setAnnualContribution(e.target.value)}
                min="0"
                max={limit}
                step="0.01"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            <button type="submit" style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Add Account</button>
          </div>
        </form>
      </div>
    </div>
  )
}
