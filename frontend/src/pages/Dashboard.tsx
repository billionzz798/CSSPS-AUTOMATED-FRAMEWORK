import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { healthCheck } from '../api/client'

export default function Dashboard() {
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    healthCheck()
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false))
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>CSSPS Testing Framework</h1>
          <p style={styles.heroSubtitle}>
            Fair Placement Algorithm for Ghana's BECE Graduates
          </p>
          <p style={styles.heroDescription}>
            Run comprehensive simulations, analyze fairness metrics, and verify system performance at scale
          </p>
        </div>
        <div style={styles.heroAccent}></div>
      </div>

      <div style={styles.statusCard}>
        <span style={styles.statusLabel}>🔌 Backend Status</span>
        <span style={{
          ...styles.statusBadge,
          ...(apiOk === true ? styles.statusOk : apiOk === false ? styles.statusError : styles.statusPending),
        }}>
          {apiOk === true ? '✓ Connected' : apiOk === false ? '✗ Not connected' : '⟳ Checking…'}
        </span>
        {apiOk === false && (
          <span style={styles.statusHint}>Start the backend (see README) to enable simulations.</span>
        )}
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Start</h2>
        <ol style={styles.steps}>
          <li>
            <strong>Run a simulation</strong> — Go to <Link to="/simulation" style={styles.inlineLink}>Run Simulation</Link>, enter candidates and schools, then click “Run simulation”.
          </li>
          <li>
            <strong>View results</strong> — You’ll be taken to a results page. If it says “Running…”, wait a few seconds; it will update automatically with placement rate, fairness metrics, and a sample table.
          </li>
          <li>            <strong>Compare frameworks</strong> — Use <Link to="/compare" style={styles.inlineLink}>Compare Frameworks</Link> to run the automated framework against the GES baseline system on the same dataset and see which performs better.
          </li>
          <li>            <strong>Load testing</strong> — Use <Link to="/load-test" style={styles.inlineLink}>Load & Resilience</Link> to check that the system is up and to run large runs (e.g. 585K candidates).
          </li>
        </ol>
      </section>

      <div style={styles.grid}>
        <Link to="/simulation" className="card-link" style={styles.card}>
          <span style={styles.cardIcon}>▶</span>
          <h2 style={styles.cardTitle}>Run Simulation</h2>
          <p style={styles.cardDesc}>
            Set candidates, schools, and choices. Run the placement algorithm and see full results on the next page.
          </p>
        </Link>
        <Link to="/compare" className="card-link" style={styles.card}>
          <span style={styles.cardIcon}>📊</span>
          <h2 style={styles.cardTitle}>Compare Frameworks</h2>
          <p style={styles.cardDesc}>
            Run the automated framework and GES baseline side-by-side on the same data to see which performs better.
          </p>
        </Link>
        <Link to="/load-test" className="card-link" style={styles.card}>
          <span style={styles.cardIcon}>⚡</span>
          <h2 style={styles.cardTitle}>Load & Resilience</h2>
          <p style={styles.cardDesc}>
            Check that the API and placement engine are ready. Start a 585K stress test and view its results.
          </p>
        </Link>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How the placement algorithm works</h2>
        <ul style={styles.list}>
          <li><strong>Merit-based:</strong> Candidates are ranked by BECE aggregate (best six subjects; lower score is better).</li>
          <li><strong>Choice respect:</strong> Each candidate is placed in their highest-preferred school that still has space.</li>
          <li><strong>Transparent:</strong> Results show placement rate, first-choice rate, and fairness metrics so you can verify behaviour.</li>
        </ul>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { 
    padding: '0 0 80px',
    background: 'linear-gradient(180deg, rgba(255, 209, 0, 0.04) 0%, transparent 40%)',
  },
  heroSection: {
    position: 'relative',
    padding: '72px 48px',
    marginBottom: 56,
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 20%, #006A3D 40%, #FFD100 60%, #FF8C42 80%, #D21034 100%)',
    boxShadow: '0 16px 48px rgba(210, 16, 52, 0.35), 0 0 1px rgba(0,0,0,0.1)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    color: 'white',
    maxWidth: 850,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 900,
    margin: '0 0 16px',
    textShadow: '0 3px 12px rgba(0, 0, 0, 0.25)',
    letterSpacing: '-1.5px',
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: 800,
    margin: '0 0 18px',
    color: 'rgba(255, 255, 255, 0.98)',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  heroDescription: {
    fontSize: 17,
    margin: 0,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 1.8,
    maxWidth: 750,
    fontWeight: 500,
  },
  heroAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '450px',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 70%)',
    pointerEvents: 'none',
  },
  title: { 
    fontSize: 36, 
    fontWeight: 700, 
    margin: '0 0 8px',
    background: 'linear-gradient(135deg, #006A3D 0%, #004a2e 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { 
    color: 'var(--text-muted)', 
    margin: '0 0 32px', 
    maxWidth: 700,
    fontSize: 16,
    lineHeight: 1.6,
  },
  statusCard: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    padding: '24px 32px',
    background: 'linear-gradient(135deg, rgba(255, 209, 0, 0.18), rgba(0, 170, 81, 0.12))',
    borderRadius: 'var(--radius)',
    border: '2px solid rgba(255, 209, 0, 0.4)',
    marginBottom: 56,
    boxShadow: '0 6px 20px rgba(255, 209, 0, 0.15)',
  },
  statusLabel: { 
    color: 'var(--text)', 
    fontSize: 16,
    fontWeight: 800,
  },
  statusBadge: { 
    fontWeight: 900, 
    fontSize: 15,
    letterSpacing: '0.5px',
    padding: '10px 18px',
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  statusOk: { 
    color: '#058c42', 
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    fontWeight: 900,
    border: '1px solid rgba(5, 150, 105, 0.4)',
  },
  statusError: { 
    color: '#d71000', 
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    fontWeight: 900,
    border: '1px solid rgba(220, 38, 38, 0.4)',
  },
  statusPending: { 
    color: '#b88c00', 
    backgroundColor: 'rgba(202, 138, 4, 0.2)',
    fontWeight: 900,
    border: '1px solid rgba(202, 138, 4, 0.4)',
  },
  statusHint: { 
    fontSize: 14, 
    color: 'var(--text)', 
    marginLeft: 'auto',
    fontWeight: 600,
  },
  section: { marginBottom: 64 },
  sectionTitle: { 
    fontSize: 28, 
    fontWeight: 900, 
    margin: '0 0 32px',
    color: 'var(--text)',
    position: 'relative',
    paddingBottom: 14,
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 35%, #FFD100 70%, #FF8C42 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  steps: { 
    margin: 0, 
    paddingLeft: 28, 
    color: 'var(--text-muted)', 
    lineHeight: 2.4, 
    fontSize: 16,
  },
  inlineLink: { 
    color: '#D21034', 
    textDecoration: 'none',
    fontWeight: 800,
    borderBottom: '2.5px solid #D21034',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 36,
    marginBottom: 64,
  },
  card: {
    display: 'block',
    padding: 40,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfd 100%)',
    border: '2.5px solid transparent',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: { 
    fontSize: 56, 
    marginBottom: 20, 
    opacity: 1,
    display: 'block',
    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))',
  },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: 900, 
    margin: '0 0 16px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  cardDesc: { 
    color: 'var(--text-muted)', 
    margin: 0, 
    fontSize: 16, 
    lineHeight: 1.8,
  },
  list: { 
    color: 'var(--text-muted)', 
    margin: 0, 
    paddingLeft: 28, 
    lineHeight: 2.2, 
    fontSize: 16,
  },
}
