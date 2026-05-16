import { useEffect, useRef, useState } from 'react'
import type { Card, Transaction } from '../types'

interface Props {
  transactions: Transaction[]
  cards: Card[]
  onAddCard: (card: Omit<Card, 'id'>) => void
}

function fmtCurrency(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}

export default function Cards({ transactions, cards, onAddCard }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {modalOpen && (
        <AddCardModal
          onClose={() => setModalOpen(false)}
          onAdd={card => { onAddCard(card); setModalOpen(false) }}
        />
      )}

      <div style={{ padding: '48px 48px 80px', maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Overview
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '-1px', lineHeight: 1 }}>
              Cards
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
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
            }}
          >
            + Add Card
          </button>
        </div>

        {cards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: 'var(--text-muted)',
            fontSize: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
          }}>
            <p style={{ marginBottom: '8px', fontSize: '32px', opacity: 0.3 }}>▣</p>
            <p>No cards yet. Add a card to track your credit utilization.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cards.map(card => {
              const spent = transactions
                .filter(tx =>
                  tx.paymentMethod?.toLowerCase() === card.name.toLowerCase() && tx.amount < 0
                )
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

              const available = card.limit - spent
              const pct = Math.min((spent / card.limit) * 100, 100)
              const barColor = pct < 30 ? 'var(--positive)' : pct < 70 ? 'var(--pending)' : 'var(--negative)'

              return (
                <div
                  key={card.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px 28px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{card.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {fmtCurrency(card.limit)} limit
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        fontVariantNumeric: 'tabular-nums',
                        color: pct > 70 ? 'var(--negative)' : 'var(--text)',
                        lineHeight: 1,
                        marginBottom: '4px',
                      }}>
                        {fmtCurrency(spent)}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>spent</p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: '999px', height: '6px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: barColor,
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {fmtCurrency(available)} available
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: barColor }}>
                      {pct.toFixed(0)}% utilized
                    </span>
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

function AddCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (card: Omit<Card, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedLimit = parseFloat(limit)
    if (!name.trim() || isNaN(parsedLimit) || parsedLimit <= 0) return
    onAdd({ name: name.trim(), limit: parsedLimit })
  }

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
          maxWidth: '400px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '-0.5px' }}>Add Card</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>Card Name</label>
            <input
              ref={firstRef}
              type="text"
              placeholder="e.g. Amex Gold, Chase Sapphire"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Credit Limit</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              min="1"
              step="1"
              required
              style={inputStyle}
            />
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
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
