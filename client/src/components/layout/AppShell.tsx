
const navItems = [
  { label: 'Dashboard', icon: '◈', href: '#' },
  { label: 'Transactions', icon: '↕', href: '#' },
  { label: 'Bills', icon: '◷', href: '#' },
  { label: 'Accounts', icon: '▣', href: '#' },
  { label: 'Settings', icon: '◎', href: '#' },
]

interface AppShellProps {
  children: React.ReactNode
  activePage: string
  onNavigate: (page: string) => void
}

export default function AppShell({ children, activePage, onNavigate }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '220px', background: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column', padding: '32px 0', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '0 24px 40px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#fff', letterSpacing: '-0.5px' }}>Fina</span>
          <span style={{ color: 'var(--accent)', fontSize: '6px', marginLeft: '2px', verticalAlign: 'super' }}>●</span>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => onNavigate(item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 24px',
                color: activePage === item.label ? '#fff' : '#6b7280',
                background: activePage === item.label ? 'rgba(255,255,255,0.06)' : 'transparent',
                borderLeft: activePage === item.label ? '2px solid var(--accent)' : '2px solid transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: activePage === item.label ? '500' : '400',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '16px', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '20px 24px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#fff', fontWeight: '600' }}>M</div>
            <div>
              <div style={{ fontSize: '13px', color: '#e5e5e5', fontWeight: '500' }}>Mirna</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Personal</div>
            </div>
          </div>
        </div>
      </aside>
      <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
