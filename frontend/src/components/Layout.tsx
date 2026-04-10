import { Link, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/simulation', label: 'Run Simulation' },
  { to: '/compare', label: 'Compare Frameworks' },
  { to: '/load-test', label: 'Load & Resilience' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link to="/" style={styles.logo} aria-label="CSSPS Home">
            <span style={styles.flag} aria-hidden>
              <svg width="48" height="32" viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ghana flag">
                <rect width="5" height="1" y="0" fill="#D21034" />
                <rect width="5" height="1" y="1" fill="#FFD100" />
                <rect width="5" height="1" y="2" fill="#006A3D" />
                <polygon points="2.5,0.6 2.7,1.4 3.5,1.4 2.9,1.9 3.1,2.7 2.5,2.2 1.9,2.7 2.1,1.9 1.5,1.4 2.3,1.4" fill="#000000" />
              </svg>
            </span>
            <span style={styles.logoTextWrap}>
              <span style={styles.logoTitle}>Ghana Education</span>
              <span style={styles.logoSub}>CSSPS Testing Framework</span>
            </span>
          </Link>
          <nav style={styles.nav}>
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                    ? styles.navLinkActive
                    : {}),
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 25%, #FFD100 50%, #006A3D 75%, #D21034 100%)',
    borderBottom: '3px solid rgba(0, 0, 0, 0.2)',
    padding: '0 24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    color: 'white',
    fontWeight: 700,
    fontSize: 16,
    transition: 'transform 0.2s ease',
  },
  flag: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 38,
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    border: '3px solid rgba(255, 255, 255, 0.9)',
  },
  logoTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.0,
  },
  logoTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: 'white',
    letterSpacing: '0.5px',
  },
  logoSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 500,
    letterSpacing: '0.3px',
  },
  nav: {
    display: 'flex',
    gap: 4,
  },
  navLink: {
    padding: '8px 16px',
    borderRadius: 6,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
  },
  navLinkActive: {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.15)',
    borderBottom: '2px solid var(--gh-yellow)',
  },
  main: {
    flex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    padding: 24,
  },
}
