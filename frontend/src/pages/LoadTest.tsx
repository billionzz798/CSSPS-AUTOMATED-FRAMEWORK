import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { healthCheck, resilienceCheck, startSimulation } from '../api/client'

export default function LoadTest() {
  const [health, setHealth] = useState<boolean | null>(null)
  const [resilience, setResilience] = useState<{ ok: boolean; placement_engine?: string } | null>(null)
  const [stressJobId, setStressJobId] = useState<string | null>(null)
  const [stressLoading, setStressLoading] = useState(false)
  const [stressError, setStressError] = useState<string | null>(null)

  useEffect(() => {
    healthCheck().then(() => setHealth(true)).catch(() => setHealth(false))
    resilienceCheck().then(setResilience).catch(() => setResilience({ ok: false }))
  }, [])

  async function run585K() {
    setStressError(null)
    setStressLoading(true)
    try {
      const res = await startSimulation({
        num_candidates: 585000,
        num_schools: 800,
        choices_per_candidate: 5,
        seed: 2026,
      })
      setStressJobId(res.job_id)
    } catch (err) {
      setStressError(err instanceof Error ? err.message : 'Failed to start')
    } finally {
      setStressLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Load & resilience</h1>
      <p style={styles.subtitle}>
        Check that the backend and placement engine are working. You can also start a large simulation (585,000 candidates) and watch the results on the next page.
      </p>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>System checks</h2>
        <div style={styles.cards}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>API health</h3>
            <p style={styles.cardStatus}>
              {health === true ? '✓ Connected' : health === false ? '✗ Not connected' : 'Checking…'}
            </p>
            <p style={styles.cardHint}>
              {health === false && 'Start the backend (e.g. uvicorn main:app) so the UI can run simulations.'}
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Placement engine</h3>
            <p style={styles.cardStatus}>
              {resilience?.ok ? '✓ Ready' : resilience ? '✗ Check failed' : 'Checking…'}
            </p>
            <p style={styles.cardHint}>
              The algorithm that places candidates into schools.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>585K stress test</h2>
        <p style={styles.sectionDesc}>
          Run a full-scale simulation: 585,000 candidates and 800 schools. It runs in the background. After you click the button, use the link below to open the results page; it may show “Running…” until the job finishes (often 1–2 minutes).
        </p>
        {stressJobId && (
          <div style={styles.resultLink}>
            <Link to={`/result/${stressJobId}`} style={styles.primaryButton}>
              View results for this run →
            </Link>
          </div>
        )}
        {stressError && (
          <p style={styles.error} role="alert">
            <strong>Error:</strong> {stressError}. Make sure the backend is running.
          </p>
        )}
        <button
          type="button"
          onClick={run585K}
          disabled={stressLoading}
          style={styles.button}
        >
          {stressLoading ? 'Starting…' : 'Start 585K simulation'}
        </button>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0 0 60px',
    minHeight: '100vh',
  },
  title: { 
    fontSize: 48, 
    fontWeight: 900, 
    margin: '0 0 14px',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { 
    color: 'var(--text-muted)', 
    margin: '0 0 48px', 
    maxWidth: 620,
    fontSize: 17,
    lineHeight: 1.8,
    fontWeight: 600,
  },
  section: { marginBottom: 64 },
  sectionTitle: { 
    fontSize: 28, 
    fontWeight: 900, 
    margin: '0 0 24px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sectionDesc: { 
    color: 'var(--text-muted)', 
    margin: '0 0 36px', 
    fontSize: 16, 
    maxWidth: 640,
    lineHeight: 1.8,
    fontWeight: 600,
  },
  cards: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
    gap: 32, 
    marginBottom: 36,
  },
  card: {
    padding: 44,
    background: 'linear-gradient(135deg, #ffffff 0%, #f6f9fb 100%)',
    border: '2.5px solid rgba(210, 16, 52, 0.18)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  cardTitle: { 
    fontSize: 22, 
    fontWeight: 900, 
    margin: '0 0 16px', 
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  cardStatus: { 
    margin: '0 0 16px', 
    fontSize: 18, 
    fontWeight: 900,
    background: 'linear-gradient(90deg, #FFD100 0%, #FF8C42 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  cardHint: { 
    margin: 0, 
    fontSize: 15, 
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    fontWeight: 600,
  },
  resultLink: { marginBottom: 22 },
  primaryButton: {
    display: 'inline-block',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 30%, #006A3D 70%, #FF8C42 100%)',
    color: 'white',
    borderRadius: 8,
    fontWeight: 900,
    textDecoration: 'none',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(210, 16, 52, 0.3)',
    letterSpacing: '0.8px',
    fontSize: 16,
  },
  error: { 
    color: '#dc2626', 
    marginBottom: 24, 
    fontSize: 16,
    fontWeight: 800,
    padding: '16px 20px',
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(210, 16, 52, 0.08))',
    border: '2px solid rgba(220, 38, 38, 0.35)',
    borderRadius: 8,
  },
  button: {
    padding: '18px 42px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 30%, #006A3D 70%, #FF8C42 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 900,
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 24px rgba(210, 16, 52, 0.35)',
    letterSpacing: '1px',
  },
}
