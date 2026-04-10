import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSimulation } from '../api/client'

export default function Simulation() {
  const navigate = useNavigate()
  const [numCandidates, setNumCandidates] = useState(10000)
  const [numSchools, setNumSchools] = useState(200)
  const [choicesPerCandidate, setChoicesPerCandidate] = useState(5)
  const [seed, setSeed] = useState<number | ''>(42)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await startSimulation({
        num_candidates: numCandidates,
        num_schools: numSchools,
        choices_per_candidate: choicesPerCandidate,
        seed: seed === '' ? undefined : seed,
      })
      navigate(`/result/${res.job_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start simulation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Run simulation</h1>
      <p style={styles.subtitle}>
        Enter how many candidates and schools you want to test. The system will run the fair placement algorithm and show you the results on the next page.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="candidates">
            Number of candidates
          </label>
          <input
            id="candidates"
            type="number"
            min={1}
            max={1000000}
            value={numCandidates}
            onChange={(e) => setNumCandidates(Number(e.target.value))}
            style={styles.input}
            aria-describedby="candidates-hint"
          />
          <span id="candidates-hint" style={styles.hint}>
            BECE graduates in the test (e.g. 10,000 for a quick run; up to 1,000,000 for stress tests).
          </span>
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="schools">
            Number of schools
          </label>
          <input
            id="schools"
            type="number"
            min={1}
            max={5000}
            value={numSchools}
            onChange={(e) => setNumSchools(Number(e.target.value))}
            style={styles.input}
          />
          <span style={styles.hint}>
            Senior High Schools (or TVETs) with limited places.
          </span>
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="choices">
            Choices per candidate
          </label>
          <input
            id="choices"
            type="number"
            min={1}
            max={11}
            value={choicesPerCandidate}
            onChange={(e) => setChoicesPerCandidate(Number(e.target.value))}
            style={styles.input}
          />
          <span style={styles.hint}>
            How many school choices each candidate can list (CSSPS allows up to 11).
          </span>
        </div>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="seed">
            Random seed (optional)
          </label>
          <input
            id="seed"
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
            style={styles.input}
            placeholder="Leave empty for random"
          />
          <span style={styles.hint}>
            Same seed gives the same test data every time (useful for comparing runs).
          </span>
        </div>
        {error && (
          <div style={styles.errorBox} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Starting simulation…' : 'Run simulation'}
        </button>
      </form>

      <div style={styles.helpCard}>
        <h3 style={styles.helpTitle}>What happens next?</h3>
        <ol style={styles.helpList}>
          <li>You’ll be taken to a results page that may say “Running…” at first.</li>
          <li>When the run finishes, you’ll see: total placed, placement rate, first-choice rate, and a sample table.</li>
          <li>Large runs (e.g. 500,000+ candidates) can take a minute or more; the page updates automatically.</li>
        </ol>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0 0 80px',
  },
  title: { 
    fontSize: 40, 
    fontWeight: 800, 
    margin: '0 0 12px',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { 
    color: 'var(--text-muted)', 
    margin: '0 0 40px', 
    maxWidth: 600,
    fontSize: 16,
    lineHeight: 1.7,
  },
  form: { 
    maxWidth: 600,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfd 100%)',
    padding: 52,
    borderRadius: 'var(--radius-lg)',
    border: '2.5px solid rgba(210, 16, 52, 0.2)',
    boxShadow: '0 12px 32px rgba(210, 16, 52, 0.2)',
  },
  field: { marginBottom: 32 },
  label: { 
    display: 'block', 
    fontWeight: 900, 
    marginBottom: 12, 
    fontSize: 16,
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '2.5px solid rgba(210, 16, 52, 0.25)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 15,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  hint: { 
    display: 'block', 
    fontSize: 15, 
    color: 'var(--text-muted)', 
    marginTop: 12,
    lineHeight: 1.7,
  },
  errorBox: {
    padding: 18,
    marginBottom: 24,
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(210, 16, 52, 0.1))',
    border: '2px solid #dc2626',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 700,
  },
  button: {
    width: '100%',
    padding: '18px 32px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 30%, #006A3D 70%, #FF8C42 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontWeight: 900,
    fontSize: 17,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(210, 16, 52, 0.3)',
    letterSpacing: '0.8px',
  },
  helpCard: {
    marginTop: 56,
    padding: 40,
    background: 'linear-gradient(135deg, #fffdf8 0%, #fff9f5 100%)',
    border: '2.5px solid rgba(255, 140, 66, 0.35)',
    borderRadius: 'var(--radius-lg)',
    maxWidth: 600,
    boxShadow: '0 8px 24px rgba(255, 140, 66, 0.2)',
  },
  helpTitle: { 
    fontSize: 22, 
    fontWeight: 900, 
    margin: '0 0 20px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #FFD100 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  helpList: { 
    margin: 0, 
    paddingLeft: 28, 
    color: 'var(--text-muted)', 
    lineHeight: 2.2, 
    fontSize: 16,
  },
}
