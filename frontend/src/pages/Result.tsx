import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSimulationResult } from '../api/client'
import type { JobResult } from '../api/client'

export default function Result() {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<JobResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!jobId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const poll = () => {
      getSimulationResult(jobId)
        .then((data) => {
          if (cancelled) return
          setJob(data)
          setLoading(false)
          if (data.status === 'running') setTimeout(poll, 1500)
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Could not load results')
            setLoading(false)
          }
        })
    }
    poll()
    return () => { cancelled = true }
  }, [jobId])

  // No job ID in URL
  if (!jobId) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>No result to show</h2>
          <p style={styles.emptyText}>Run a simulation first, then you’ll see results here.</p>
          <Link to="/simulation" style={styles.primaryButton}>Go to Run Simulation</Link>
        </div>
      </div>
    )
  }

  // Loading: waiting for first response
  if (loading && !job) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner} aria-hidden />
          <h2 style={styles.loadingTitle}>Loading your results…</h2>
          <p style={styles.loadingText}>Connecting to the server. This usually takes a second.</p>
        </div>
      </div>
    )
  }

  // Network or server error
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <p style={styles.emptyText}>Make sure the backend is running, then try again.</p>
          <Link to="/simulation" style={styles.primaryButton}>Back to Run Simulation</Link>
        </div>
      </div>
    )
  }

  // Job loaded
  const summary = job!.summary
  const results = job!.result ?? []
  const placed = results.filter((r) => r.school_code != null)
  const isRunning = job!.status === 'running'
  const isFailed = job!.status === 'failed'
  const isCompleted = job!.status === 'completed'

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/simulation" style={styles.backLink}>← Back to Run Simulation</Link>
        <h1 style={styles.title}>Simulation results</h1>
        <p style={styles.jobId}>Job: <code>{jobId}</code></p>
        <span style={{
          ...styles.badge,
          ...(isCompleted ? styles.badgeSuccess : isFailed ? styles.badgeError : styles.badgeRunning),
        }}>
          {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Running…'}
        </span>
      </div>

      {isRunning && (
        <div style={styles.runningCard}>
          <div style={styles.spinner} aria-hidden />
          <h3 style={styles.runningTitle}>Simulation in progress</h3>
          <p style={styles.runningText}>
            The placement algorithm is running. This can take a minute for large runs. This page will update automatically when it’s done.
          </p>
        </div>
      )}

      {isFailed && job!.error && (
        <div style={styles.errorCard}>
          <h3 style={styles.errorCardTitle}>Simulation failed</h3>
          <p style={styles.errorCardText}>{job!.error}</p>
          <Link to="/simulation" style={styles.primaryButton}>Run another simulation</Link>
        </div>
      )}

      {isCompleted && summary && (
        <>
          <section style={styles.section} aria-label="Summary">
            <h2 style={styles.sectionTitle}>Summary</h2>
            <p style={styles.sectionIntro}>Overview of how many candidates were placed and how quickly the run finished.</p>
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>{summary.total_candidates.toLocaleString()}</span>
                <span style={styles.metricLabel}>Total candidates</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>{summary.placed_count.toLocaleString()}</span>
                <span style={styles.metricLabel}>Placed in a school</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>{summary.unplaced_count.toLocaleString()}</span>
                <span style={styles.metricLabel}>Not placed</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>{(summary.placement_rate * 100).toFixed(1)}%</span>
                <span style={styles.metricLabel}>Placement rate</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>
                  {summary.first_choice_rate != null ? `${(summary.first_choice_rate * 100).toFixed(1)}%` : '–'}
                </span>
                <span style={styles.metricLabel}>Got 1st choice school</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricValue}>
                  {summary.duration_seconds != null ? `${summary.duration_seconds} sec` : '–'}
                </span>
                <span style={styles.metricLabel}>Time taken</span>
              </div>
            </div>
          </section>

          {summary.fairness_metrics && typeof summary.fairness_metrics === 'object' && (
            <section style={styles.section} aria-label="Equity analysis">
              <h2 style={styles.sectionTitle}>Equity Analysis</h2>
              <p style={styles.sectionIntro}>How fair the placement was: who got placed and how often first choice was satisfied.</p>
              <div style={styles.fairnessGrid}>
                {summary.fairness_metrics.placement_rate != null && (
                  <div style={{...styles.fairnessItem, ...getPlacementRateStyle(Number(summary.fairness_metrics.placement_rate))}}>
                    <span style={styles.fairnessLabel}>Placement rate</span>
                    <span style={{...styles.fairnessValue, color: getPlacementRateTextColor(Number(summary.fairness_metrics.placement_rate))}}>{(Number(summary.fairness_metrics.placement_rate) * 100).toFixed(1)}%</span>
                  </div>
                )}
                {summary.fairness_metrics.first_choice_rate != null && (
                  <div style={{...styles.fairnessItem, ...getMetricStyle(Number(summary.fairness_metrics.first_choice_rate), 0.60)}}>
                    <span style={styles.fairnessLabel}>First choice rate (of placed)</span>
                    <span style={{...styles.fairnessValue, color: getMetricTextColor(Number(summary.fairness_metrics.first_choice_rate), 0.60)}}>{(Number(summary.fairness_metrics.first_choice_rate) * 100).toFixed(1)}%</span>
                  </div>
                )}
                {summary.fairness_metrics.avg_choice_rank_placed != null && (
                  <div style={{...styles.fairnessItem, ...getChoiceRankStyle(Number(summary.fairness_metrics.avg_choice_rank_placed))}}>
                    <span style={styles.fairnessLabel}>Average choice rank (placed)</span>
                    <span style={{...styles.fairnessValue, color: getChoiceRankTextColor(Number(summary.fairness_metrics.avg_choice_rank_placed))}}>{Number(summary.fairness_metrics.avg_choice_rank_placed).toFixed(2)}</span>
                  </div>
                )}
                {summary.fairness_metrics.placed_aggregate_avg != null && (
                  <div style={styles.fairnessItem}>
                    <span style={styles.fairnessLabel}>Average BECE aggregate (placed)</span>
                    <span style={styles.fairnessValue}>{Number(summary.fairness_metrics.placed_aggregate_avg).toFixed(1)}</span>
                  </div>
                )}
                {summary.fairness_metrics.unplaced_aggregate_avg != null && (
                  <div style={styles.fairnessItem}>
                    <span style={styles.fairnessLabel}>Average BECE aggregate (unplaced)</span>
                    <span style={styles.fairnessValue}>{Number(summary.fairness_metrics.unplaced_aggregate_avg).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {results.length > 0 && (
            <section style={styles.section} aria-label="Sample results">
              <h2 style={styles.sectionTitle}>Sample placement results</h2>
              <p style={styles.sectionIntro}>
                First 100 rows. {placed.length.toLocaleString()} candidates were placed; {(results.length - placed.length).toLocaleString()} were not placed (no space in their chosen schools).
              </p>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Candidate ID</th>
                      <th style={styles.th}>BECE aggregate</th>
                      <th style={styles.th}>School placed</th>
                      <th style={styles.th}>Choice number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 100).map((r, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{r.candidate_id}</td>
                        <td style={styles.td}>{r.aggregate}</td>
                        <td style={styles.td}>{r.school_code ?? '–'}</td>
                        <td style={styles.td}>{r.choice_rank ?? '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div style={styles.actions}>
            <Link to="/simulation" style={styles.primaryButton}>Run another simulation</Link>
          </div>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 0 60px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
  },
  header: { marginBottom: 44, maxWidth: '1100px', margin: '0 auto 44px', paddingLeft: 40, paddingRight: 40 },
  backLink: { color: 'var(--accent)', fontSize: 15, marginBottom: 14, display: 'inline-block', textDecoration: 'none', fontWeight: 700 },
  title: { fontSize: 32, fontWeight: 900, margin: '0 0 8px', background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  jobId: { fontSize: 14, color: 'var(--text-muted)', margin: '0 0 12px', wordBreak: 'break-all', fontWeight: 600 },
  badge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 900,
    border: '2px solid',
  },
  badgeSuccess: { 
    background: 'linear-gradient(135deg, #006A3D, #00a651)', 
    color: 'white',
    fontWeight: 900,
    borderColor: '#006A3D',
  },
  badgeError: { 
    background: 'linear-gradient(135deg, #dc2626, #991b1b)', 
    color: '#fff',
    fontWeight: 900,
    borderColor: '#dc2626',
  },
  badgeRunning: { 
    background: 'linear-gradient(135deg, #FFD100, #ff8c42)', 
    color: '#000',
    fontWeight: 900,
    borderColor: '#FFD100',
  },
  loadingState: {
    textAlign: 'center',
    padding: '64px 40px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    border: '2.5px solid rgba(210, 16, 52, 0.15)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
  },
  spinner: {
    width: 56,
    height: 56,
    border: '4px solid rgba(210, 16, 52, 0.2)',
    borderTopColor: '#D21034',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 24px',
  },
  loadingTitle: { fontSize: 24, fontWeight: 900, margin: '0 0 12px', color: 'var(--text)' },
  loadingText: { color: 'var(--text-muted)', margin: 0, fontSize: 16, fontWeight: 600 },
  runningCard: {
    padding: 44,
    marginBottom: 44,
    background: 'linear-gradient(135deg, #fffdf8 0%, #fff9f5 100%)',
    border: '2.5px solid rgba(255, 140, 66, 0.35)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(255, 140, 66, 0.2)',
    maxWidth: '1100px',
    margin: '0 auto 44px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  runningTitle: { fontSize: 22, fontWeight: 900, margin: '0 0 14px', color: 'var(--text)' },
  runningText: { color: 'var(--text-muted)', margin: 0, fontSize: 16, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7, fontWeight: 600 },
  errorCard: {
    padding: 36,
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(210, 16, 52, 0.08))',
    border: '2.5px solid rgba(220, 38, 38, 0.35)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 36,
    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.15)',
    maxWidth: '1100px',
    margin: '0 auto 36px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  errorCardTitle: { fontSize: 22, fontWeight: 900, margin: '0 0 14px', color: '#dc2626' },
  errorCardText: { color: 'var(--text-muted)', margin: '0 0 18px', fontSize: 16, fontWeight: 600 },
  emptyState: {
    textAlign: 'center',
    padding: '64px 40px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    border: '2.5px solid rgba(210, 16, 52, 0.15)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '1100px',
    margin: '40px auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  emptyTitle: { fontSize: 26, fontWeight: 900, margin: '0 0 14px', background: 'linear-gradient(90deg, #D21034 0%, #FFD100 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  emptyText: { color: 'var(--text-muted)', margin: '0 0 28px', fontSize: 16, fontWeight: 600 },
  errorText: { color: '#dc2626', margin: '0 0 14px', fontSize: 16, fontWeight: 700 },
  primaryButton: {
    display: 'inline-block',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #FF6B35 0%, #D21034 30%, #006A3D 70%, #FF8C42 100%)',
    color: 'white',
    borderRadius: 8,
    fontWeight: 900,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(210, 16, 52, 0.3)',
    fontSize: 16,
    letterSpacing: '0.8px',
  },
  section: { marginBottom: 60, maxWidth: '1100px', margin: '0 auto 60px', paddingLeft: 40, paddingRight: 40 },
  sectionTitle: { fontSize: 26, fontWeight: 900, margin: '0 0 12px', background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  sectionIntro: { color: 'var(--text-muted)', fontSize: 16, margin: '0 0 24px', maxWidth: 600, lineHeight: 1.7, fontWeight: 600 },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 28,
  },
  metricCard: {
    padding: 32,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    border: '2.5px solid rgba(210, 16, 52, 0.15)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  metricValue: { display: 'block', fontSize: 32, fontWeight: 900, marginBottom: 10, background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  metricLabel: { fontSize: 14, color: 'var(--text-muted)', fontWeight: 700 },
  fairnessGrid: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 520 },
  fairnessItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderRadius: 8, border: '2.5px solid rgba(210, 16, 52, 0.2)', transition: 'all 0.2s ease', background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)' },
  fairnessLabel: { fontSize: 16, color: 'var(--text)', fontWeight: 700 },
  fairnessValue: { fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg, #D21034 0%, #006A3D 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  tableWrap: {
    overflow: 'auto',
    border: '2.5px solid rgba(210, 16, 52, 0.15)',
    borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbfc 100%)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '20px 24px',
    backgroundColor: 'rgba(210, 16, 52, 0.08)',
    borderBottom: '2.5px solid rgba(210, 16, 52, 0.2)',
    fontSize: 15,
    fontWeight: 900,
    color: '#D21034',
  },
  td: { padding: '18px 24px', borderBottom: '1px solid rgba(210, 16, 52, 0.1)', fontSize: 15, color: 'var(--text)', fontWeight: 600 },
  actions: { marginTop: 60, maxWidth: '1100px', margin: '60px auto 0', paddingLeft: 40, paddingRight: 40 },
}

// Color helper functions for equity metrics
function getPlacementRateStyle(rate: number): React.CSSProperties {
  if (rate >= 0.83) return { background: 'rgba(34, 134, 58, 0.12)', borderColor: 'rgba(34, 134, 58, 0.3)' } // Excellent green
  if (rate >= 0.80) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }  // Good green
  if (rate >= 0.75) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }  // Fair green
  return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }                     // Positive green
}

function getPlacementRateTextColor(rate: number): string {
  if (rate >= 0.83) return '#22863a' // Excellent green
  if (rate >= 0.80) return '#28a745' // Good green
  if (rate >= 0.75) return '#28a745' // Fair green
  return '#28a745'                    // Positive green
}

function getMetricStyle(value: number, threshold: number): React.CSSProperties {
  if (value >= threshold) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }  // Good green
  if (value >= threshold - 0.05) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' } // Fair green
  return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }                               // Positive green
}

function getMetricTextColor(value: number, threshold: number): string {
  if (value >= threshold) return '#28a745'  // Good green
  if (value >= threshold - 0.05) return '#28a745' // Fair green
  return '#28a745'                         // Positive green
}

function getChoiceRankStyle(rank: number): React.CSSProperties {
  if (rank <= 2.5) return { background: 'rgba(34, 134, 58, 0.12)', borderColor: 'rgba(34, 134, 58, 0.3)' } // Excellent dark green
  if (rank <= 3.5) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' } // Good green
  if (rank <= 4.5) return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' } // Fair green
  return { background: 'rgba(76, 175, 80, 0.12)', borderColor: 'rgba(76, 175, 80, 0.3)' }                   // Positive green
}

function getChoiceRankTextColor(rank: number): string {
  if (rank <= 2.5) return '#22863a' // Excellent dark green
  if (rank <= 3.5) return '#28a745' // Good green
  if (rank <= 4.5) return '#28a745' // Fair green
  return '#28a745'                  // Positive green
}
