import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startComparison } from '../api/client'

export default function Compare() {
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
      const res = await startComparison({
        num_candidates: numCandidates,
        num_schools: numSchools,
        choices_per_candidate: choicesPerCandidate,
        seed: seed === '' ? undefined : seed,
      })
      navigate(`/comparison/${res.job_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start comparison')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Framework Comparison</h1>
      <p style={styles.subtitle}>
        Compare the automated fair placement framework against the current GES baseline system. 
        Both frameworks will run on the same dataset using actual BECE parameters.
      </p>
      <p style={styles.description}>
        The comparison analyzes placement success rates, candidate satisfaction, and equity across regions and gender groups.
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
            onChange={(e) => setNumCandidates(parseInt(e.target.value) || 1)}
            style={styles.input}
          />
          <p style={styles.hint}>
            Recommended: 10,000–100,000 for reliable comparison. Use 553,155 for full 2024 BECE scale.
          </p>
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
            onChange={(e) => setNumSchools(parseInt(e.target.value) || 1)}
            style={styles.input}
          />
          <p style={styles.hint}>
            Ghana has 721 public SHS/TVET schools. Use this for realistic simulation.
          </p>
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="choices">
            School choices per candidate
          </label>
          <input
            id="choices"
            type="number"
            min={1}
            max={11}
            value={choicesPerCandidate}
            onChange={(e) => setChoicesPerCandidate(parseInt(e.target.value) || 5)}
            style={styles.input}
          />
          <p style={styles.hint}>
            CSSPS allows up to 11 choices. Realistic average: 5–6.
          </p>
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="seed">
            Random seed (optional, for reproducibility)
          </label>
          <input
            id="seed"
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value === '' ? '' : parseInt(e.target.value))}
            placeholder="Leave blank for random"
            style={styles.input}
          />
          <p style={styles.hint}>
            Use the same seed to reproduce results. Default: system random.
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.6 : 1}}>
          {loading ? 'Running comparison...' : 'Run framework comparison'}
        </button>
      </form>

      <div style={styles.info}>
        <h3 style={styles.infoTitle}>What gets compared?</h3>
        <ul style={styles.infoList}>
          <li><strong>Placement Success:</strong> Overall placement rate and first-choice satisfaction</li>
          <li><strong>Equity Performance:</strong> Fairness across regions and gender groups</li>
          <li><strong>Candidate Outcomes:</strong> How many improved, degraded, or newly placed</li>
          <li><strong>System Efficiency:</strong> Processing time and school capacity utilization</li>
          <li><strong>Verdict:</strong> Which framework performs better overall</li>
        </ul>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '650px',
    margin: '0 auto',
    padding: '0 0 80px',
  },
  title: {
    fontSize: '44px',
    fontWeight: 800,
    marginBottom: '12px',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
    lineHeight: '1.7',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginBottom: '40px',
    lineHeight: '1.7',
  },
  form: {
    marginBottom: '56px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    padding: 52,
    borderRadius: 'var(--radius-lg)',
    border: '2.5px solid rgba(210, 16, 52, 0.2)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },
  field: {
    marginBottom: '36px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '900',
    marginBottom: '12px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    border: '2.5px solid rgba(210, 16, 52, 0.25)',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: 'var(--text)',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  hint: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginTop: '12px',
    marginBottom: 0,
    lineHeight: '1.6',
  },
  button: {
    width: '100%',
    padding: '18px 32px',
    fontSize: '17px',
    fontWeight: '900',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 30%, #006A3D 70%, #FF8C42 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(210, 16, 52, 0.3)',
    letterSpacing: '0.8px',
  },
  error: {
    padding: '20px',
    marginBottom: '28px',
    backgroundColor: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(210, 16, 52, 0.15))',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '15px',
    border: '2px solid #dc2626',
    fontWeight: 800,
  },
  info: {
    padding: '40px',
    backgroundColor: 'linear-gradient(135deg, #fffdf8 0%, #fff9f5 100%)',
    borderRadius: 'var(--radius-lg)',
    marginTop: '56px',
    border: '2.5px solid rgba(255, 140, 66, 0.35)',
    boxShadow: '0 8px 24px rgba(255, 140, 66, 0.2)',
  },
  infoTitle: {
    fontSize: '22px',
    fontWeight: '900',
    marginBottom: '20px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #FFD100 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  infoList: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    marginLeft: '24px',
    lineHeight: '2.2',
  },
}
