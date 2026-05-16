import QuickAdd from '../components/QuickAdd'
import type { Transaction, NewTransaction } from '../types'

interface Props {
  transactions: Transaction[]
  onAddTransaction: (tx: NewTransaction) => void
}

const balance = {
  bank: 3240.50,
  pending: -184.20,
  upcoming: -620.00,
}

const available = balance.bank + balance.pending + balance.upcoming

const bills = [
  { name: 'Rent', due: 'Jun 1', amount: 450.00 },
  { name: 'Electric', due: 'May 18', amount: 89.00 },
  { name: 'Phone', due: 'May 22', amount: 81.00 },
]

function fmt(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })
  return n < 0 ? `-$${abs}` : `$${abs}`
}

export default function Dashboard({ transactions, onAddTransaction }: Props) {
  const recent = transactions.slice(0, 5)

  return (
    <div style={{ padding: '48px 48px 80px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
          Real Available Balance
        </p>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 8vw, 80px)',
          color: available < 500 ? 'var(--negative)' : 'var(--text)',
          lineHeight: 1,
          letterSpacing: '-2px',
        }}>
          {fmt(available)}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px' }}>Updated just now</p>
      </div>

      <QuickAdd onAddTransaction={onAddTransaction} />

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}>
        {[
          { label: 'Bank Balance', value: balance.bank, note: 'as reported' },
          { label: 'Pending', value: balance.pending, note: '3 transactions' },
          { label: 'Upcoming Bills', value: balance.upcoming, note: 'next 30 days' },
        ].map((item, i) => (
          <div key={item.label} style={{ padding: '0 24px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '600', color: item.value < 0 ? 'var(--negative)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(item.value)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Recent Transactions</span>
            <span style={{ fontSize: '12px', color: 'var(--accent)', cursor: 'pointer' }}>See all</span>
          </div>
          {recent.map((tx, i) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{tx.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {tx.date}
                  {tx.status === 'pending' && (
                    <span style={{ fontSize: '10px', background: 'rgba(217,119,6,0.12)', color: 'var(--pending)', padding: '1px 6px', borderRadius: '999px', fontWeight: '500' }}>
                      pending
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: tx.amount > 0 ? 'var(--positive)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(tx.amount)}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Upcoming Bills</span>
          </div>
          {bills.map((bill, i) => (
            <div key={bill.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i < bills.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{bill.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Due {bill.due}</div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: 'var(--negative)' }}>
                -{fmt(bill.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
