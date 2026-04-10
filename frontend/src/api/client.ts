const BASE = ''

export type SimulationRequest = {
  num_candidates: number
  num_schools: number
  choices_per_candidate: number
  config?: { equity_mode?: string; prefer_catchment?: boolean; max_choices_considered?: number }
  seed?: number
}

export type SimulationResponse = { job_id: string; status: string; message: string }

export type JobResult = {
  status: string
  result?: Array<{ candidate_id: string; school_code: string | null; choice_rank: number | null; aggregate: number }>
  summary?: {
    job_id: string
    status: string
    total_candidates: number
    placed_count: number
    unplaced_count: number
    placement_rate: number
    first_choice_rate: number
    avg_choice_rank_placed: number | null
    duration_seconds: number
    fairness_metrics?: Record<string, unknown>
  }
  error?: string
}

export async function startSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(`${BASE}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getSimulationResult(jobId: string): Promise<JobResult> {
  const res = await fetch(`${BASE}/api/simulate/${jobId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}

export async function resilienceCheck(): Promise<{ ok: boolean; placement_engine?: string }> {
  const res = await fetch(`${BASE}/api/resilience/check`)
  if (!res.ok) throw new Error('Resilience check failed')
  return res.json()
}

export type ComparisonResult = {
  status: string
  result?: {
    job_id: string
    parameters: {
      num_candidates: number
      num_schools: number
      choices_per_candidate: number
      config: Record<string, unknown>
      seed?: number
    }
    baseline: {
      framework_name: string
      metrics: Record<string, unknown>
      duration_seconds: number
    }
    automated: {
      framework_name: string
      metrics: Record<string, unknown>
      duration_seconds: number
    }
    comparison: {
      placement_performance: {
        baseline_placement_rate: number
        framework_placement_rate: number
        delta: number
        delta_percentage: number
      }
      satisfaction: {
        baseline_first_choice_rate: number
        framework_first_choice_rate: number
        delta: number
        satisfied_both: number
        improved_choice_rank: number
        degraded_choice_rank: number
        newly_placed: number
        newly_unplaced: number
      }
      equity: {
        regional_improvement: Record<string, number>
        gender_improvement: Record<string, number>
      }
      verdict: {
        result: string
        description: string
        framework_score: number
        baseline_score: number
      }
    }
    total_duration_seconds: number
  }
  error?: string
}

export async function startComparison(req: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(`${BASE}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getComparisonResult(jobId: string): Promise<ComparisonResult> {
  const res = await fetch(`${BASE}/api/compare/${jobId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
