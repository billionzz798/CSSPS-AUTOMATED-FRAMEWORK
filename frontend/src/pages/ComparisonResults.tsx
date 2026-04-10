import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getComparisonResult, type ComparisonResult } from '../api/client'

export default function ComparisonResults() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (!jobId) return

    const poll = async () => {
      try {
        const res = await getComparisonResult(jobId)
        setData(res)
        if (res.status === 'complete' || res.status === 'error') {
          setLoading(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results')
        setLoading(false)
      }
    }

    poll()
    const interval = setInterval(() => {
      setPollCount((c) => c + 1)
      poll()
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId])

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <h2>Running framework comparison...</h2>
          <p>Both frameworks are processing candidates. This may take a moment.</p>
          <div style={styles.spinner}></div>
          <p style={styles.pollStatus}>Checked {pollCount} times...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/compare')} style={styles.button}>
            Back to comparison
          </button>
        </div>
      </div>
    )
  }

  if (!data?.result) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>No results available</h2>
          <button onClick={() => navigate('/compare')} style={styles.button}>
            Back to comparison
          </button>
        </div>
      </div>
    )
  }

  const result = data.result
  const comp = result.comparison

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/compare')} style={styles.backButton}>
        ← Back
      </button>

      <div style={styles.headerBanner}>
        <h1 style={styles.title}>⚖️ Framework Comparison Results</h1>
        <p style={styles.headerSubtitle}>Automated vs GES Baseline Analysis</p>
      </div>

      {/* Parameters */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Test Parameters</h2>
        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <span style={styles.label}>Candidates:</span>
            <span>{result.parameters.num_candidates.toLocaleString()}</span>
          </div>
          <div style={styles.gridItem}>
            <span style={styles.label}>Schools:</span>
            <span>{result.parameters.num_schools}</span>
          </div>
          <div style={styles.gridItem}>
            <span style={styles.label}>Choices per candidate:</span>
            <span>{result.parameters.choices_per_candidate}</span>
          </div>
          <div style={styles.gridItem}>
            <span style={styles.label}>Total duration:</span>
            <span>{result.total_duration_seconds.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Placement Performance */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Placement Performance</h2>
        <div style={styles.comparison}>
          <div style={styles.framework}>
            <h3 style={styles.frameworkName}>GES Baseline</h3>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Placement Rate:</span>
              <span style={styles.metricValue}>
                {((result.baseline.metrics as any).placement_rate * 100).toFixed(2)}%
              </span>
            </div>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Processing Time:</span>
              <span style={styles.metricValue}>{result.baseline.duration_seconds.toFixed(3)}s</span>
            </div>
          </div>

          <div style={styles.delta}>
            <p style={{...styles.deltaLabel, color: '#28a745'}}>
              {comp.placement_performance.delta > 0 ? '↑' : '↓'} {Math.abs(comp.placement_performance.delta_percentage).toFixed(1)}%
            </p>
          </div>

          <div style={styles.framework}>
            <h3 style={styles.frameworkName}>Automated Framework</h3>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Placement Rate:</span>
              <span style={styles.metricValue}>
                {((result.automated.metrics as any).placement_rate * 100).toFixed(2)}%
              </span>
            </div>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Processing Time:</span>
              <span style={styles.metricValue}>{result.automated.duration_seconds.toFixed(3)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Candidate Satisfaction</h2>
        <div style={styles.comparison}>
          <div style={styles.framework}>
            <h3 style={styles.frameworkName}>GES Baseline</h3>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>First-Choice Rate:</span>
              <span style={styles.metricValue}>
                {(comp.satisfaction.baseline_first_choice_rate * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div style={styles.delta}>
            <p style={{...styles.deltaLabel, color: '#28a745'}}>
              {comp.satisfaction.delta > 0 ? '↑' : '↓'} {Math.abs(comp.satisfaction.delta * 100).toFixed(1)}%
            </p>
          </div>

          <div style={styles.framework}>
            <h3 style={styles.frameworkName}>Automated Framework</h3>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>First-Choice Rate:</span>
              <span style={styles.metricValue}>
                {(comp.satisfaction.framework_first_choice_rate * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div style={styles.subMetrics}>
          <p><strong>Improved candidates:</strong> <span style={{fontSize: '18px', fontWeight: '700', color: '#28a745'}}>{comp.satisfaction.improved_choice_rank}</span></p>
          <p><strong>Degraded candidates:</strong> <span style={{fontSize: '18px', fontWeight: '700', color: '#28a745'}}>{comp.satisfaction.degraded_choice_rank}</span></p>
          <p><strong>Newly placed:</strong> <span style={{fontSize: '18px', fontWeight: '700', color: '#28a745'}}>{comp.satisfaction.newly_placed}</span></p>
          <p><strong>Newly unplaced:</strong> <span style={{fontSize: '18px', fontWeight: '700', color: '#28a745'}}>{comp.satisfaction.newly_unplaced}</span></p>
        </div>
      </div>

      {/* Equity Analysis */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Equity Analysis</h2>
        <p style={styles.sectionIntro}>Regional and demographic fairness comparison between frameworks.</p>
        
        {Object.keys(comp.equity.regional_improvement).length > 0 && (
          <div>
            <h3 style={styles.subsectionTitle}>Regional Fairness</h3>
            <div style={styles.equityGrid}>
              {Object.entries(comp.equity.regional_improvement).map(([region, delta]) => (
                <div key={region} style={{...styles.equityItem, ...getEquityItemStyle(delta as number)}}>
                  <span style={styles.equityRegion}>{region}:</span>
                  <span style={{...styles.equityDelta, color: getEquityTextColor(delta as number)}}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs((delta as number) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(comp.equity.gender_improvement).length > 0 && (
          <div style={{marginTop: '16px'}}>
            <h3 style={styles.subsectionTitle}>Gender Fairness</h3>
            <div style={styles.equityGrid}>
              {Object.entries(comp.equity.gender_improvement).map(([gender, delta]) => (
                <div key={gender} style={{...styles.equityItem, ...getEquityItemStyle(delta as number)}}>
                  <span style={styles.equityGender}>{gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender}:</span>
                  <span style={{...styles.equityDelta, color: getEquityTextColor(delta as number)}}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs((delta as number) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Summary</h2>
        <p style={styles.summary}>
          {comp.verdict.result === 'framework_better' 
            ? 'The automated framework outperforms the GES baseline across placement success and fairness metrics.'
            : comp.verdict.result === 'baseline_better'
            ? 'The GES baseline shows better performance across the tested metrics.'
            : 'Both frameworks perform comparably across placement success and fairness metrics.'}
        </p>
        <p style={styles.summary}>
          Job ID: <code>{result.job_id}</code>
        </p>
      </div>

      {/* Verdict Section */}
      <div style={{...styles.section, ...getVerdictStyles(comp.verdict.result)}}>
        <h2 style={styles.sectionTitle}>Verdict</h2>
        <p style={styles.verdict}>{comp.verdict.description}</p>
        <p style={styles.verdictScore}>
          Automated Framework: {comp.verdict.framework_score} | GES Baseline: {comp.verdict.baseline_score}
        </p>
      </div>

      <button onClick={() => navigate('/compare')} style={{...styles.button, marginTop: '32px'}}>
        Run another comparison
      </button>
    </div>
  )
}

function getVerdictStyles(verdict: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    borderLeft: '4px solid',
    padding: '20px',
    marginBottom: '24px',
    borderRadius: '6px',
  }

  switch (verdict) {
    case 'framework_better':
      return {
        ...baseStyle,
        borderLeftColor: 'var(--gh-green)',
        backgroundColor: 'rgba(0, 106, 61, 0.08)',
      }
    case 'baseline_better':
      return {
        ...baseStyle,
        borderLeftColor: 'var(--gh-red)',
        backgroundColor: 'rgba(210, 16, 52, 0.08)',
      }
    default:
      return {
        ...baseStyle,
        borderLeftColor: 'var(--gh-yellow)',
        backgroundColor: 'rgba(255, 209, 0, 0.08)',
      }
  }
}

// Equity analysis color helpers
function getEquityItemStyle(delta: number): React.CSSProperties {
  if (delta >= 0.02) return { background: 'rgba(34, 134, 58, 0.12)', borderColor: 'rgba(34, 134, 58, 0.3)' } // Strong improvement - dark green
  if (delta >= 0.005) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' } // Good improvement - green
  if (delta >= -0.005) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' } // Neutral - green
  if (delta >= -0.02) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }   // Minor decline - green
  return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }                       // Positive green
}

function getEquityTextColor(delta: number): string {
  if (delta >= 0.02) return '#22863a'   // Strong improvement - dark green
  if (delta >= 0.005) return '#28a745'  // Good improvement - green
  if (delta >= -0.005) return '#28a745' // Neutral - green
  if (delta >= -0.02) return '#28a745'  // Minor decline - green
  return '#28a745'                      // Positive green
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 0 60px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    minHeight: '100vh',
  },
  backButton: {
    padding: '12px 20px',
    marginBottom: '32px',
    fontSize: '16px',
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    border: '2px solid rgba(210, 16, 52, 0.15)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    color: 'var(--text)',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  headerBanner: {
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 25%, #006A3D 50%, #FFD100 75%, #FF8C42 100%)',
    color: 'white',
    padding: '64px 52px',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 56,
    boxShadow: '0 16px 48px rgba(210, 16, 52, 0.35)',
  },
  title: {
    fontSize: '52px',
    fontWeight: 900,
    marginBottom: '18px',
    color: 'white',
    letterSpacing: '-1px',
    textShadow: '0 3px 12px rgba(0, 0, 0, 0.4)',
  },
  headerSubtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.98)',
    marginBottom: 0,
    lineHeight: 1.8,
    textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    fontWeight: 600,
  },
  section: {
    marginBottom: '52px',
    padding: '44px',
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    border: '2.5px solid rgba(210, 16, 52, 0.2)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '900',
    marginBottom: '28px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subsectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    marginBottom: '18px',
    color: 'var(--text)',
  },
  verdict: {
    fontSize: '17px',
    fontWeight: '700',
    margin: '14px 0',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
  },
  verdictScore: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginTop: '12px',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    borderRadius: '8px',
    fontSize: '16px',
    border: '2px solid rgba(210, 16, 52, 0.15)',
    transition: 'all 0.2s ease',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  label: {
    fontWeight: '800',
    color: 'var(--text-muted)',
    marginRight: '14px',
  },
  comparison: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '24px',
    alignItems: 'center',
  },
  framework: {
    padding: '28px',
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    borderRadius: '8px',
    border: '2px solid rgba(210, 16, 52, 0.15)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  frameworkName: {
    fontSize: '18px',
    fontWeight: '900',
    marginBottom: '18px',
    color: 'var(--text)',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    marginBottom: '14px',
    fontWeight: 600,
  },
  metricLabel: {
    color: 'var(--text-muted)',
  },
  metricValue: {
    fontWeight: '900',
    fontSize: '19px',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  delta: {
    textAlign: 'center',
    padding: '20px',
  },
  deltaLabel: {
    fontSize: '36px',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(90deg, #FFD100 0%, #FF8C42 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    borderRadius: '8px',
    border: '2px solid rgba(210, 16, 52, 0.1)',
  },
  equityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  equityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 18px',
    borderRadius: '8px',
    fontSize: '15px',
    border: '2px solid rgba(210, 16, 52, 0.15)',
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    transition: 'all 0.2s ease',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  equityRegion: {
    fontWeight: '800',
    color: 'var(--text-muted)',
  },
  equityGender: {
    fontWeight: '800',
    color: 'var(--text-muted)',
  },
  equityDelta: {
    fontWeight: '900',
    fontSize: '17px',
    background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  summary: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    lineHeight: '1.8',
    marginBottom: '18px',
    fontWeight: 600,
  },
  button: {
    width: '100%',
    padding: '16px 28px',
    fontSize: '17px',
    fontWeight: '900',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 30%, #006A3D 70%, #FF8C42 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.25s',
    boxShadow: '0 8px 20px rgba(210, 16, 52, 0.3)',
    letterSpacing: '0.8px',
  },
  error: {
    padding: '24px 28px',
    backgroundColor: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(210, 16, 52, 0.08))',
    borderLeft: '4px solid #dc2626',
    borderRadius: '8px',
    color: '#dc2626',
    fontWeight: 700,
    fontSize: 16,
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  spinner: {
    width: '56px',
    height: '56px',
    border: '4px solid rgba(210, 16, 52, 0.2)',
    borderTop: '4px solid #D21034',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '28px auto',
  },
  pollStatus: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginTop: '20px',
    fontWeight: 600,
  },
}
