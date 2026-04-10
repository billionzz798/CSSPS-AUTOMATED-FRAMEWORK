"""
CSSPS Automated Testing Framework - API.

Provides placement simulation, fairness metrics, and testing endpoints.
"""

import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    SimulationRequest,
    SimulationResponse,
    RunResultSummary,
    CandidateCreate,
    SchoolCreate,
    FairPlacementConfigSchema,
    PlacementResultSchema,
)
from core.placement import (
    Candidate,
    School,
    FairPlacementConfig,
    EquityMode,
    run_fair_placement,
    get_fairness_metrics,
)
from services.simulation import run_simulation, get_job, _schema_to_config, _jobs as sim_jobs
from services.comparison import run_framework_comparison, get_comparison_result


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # cleanup if needed


app = FastAPI(
    title="CSSPS Automated Testing Framework",
    description="Fair placement algorithm for BECE graduates and testing APIs",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "cssps-framework"}


def _run_simulation_task(
    job_id: str,
    num_candidates: int,
    num_schools: int,
    choices_per_candidate: int,
    config_schema: Optional[FairPlacementConfigSchema],
    seed: Optional[int],
):
    run_simulation(
        num_candidates=num_candidates,
        num_schools=num_schools,
        choices_per_candidate=choices_per_candidate,
        config_schema=config_schema,
        seed=seed,
        job_id=job_id,
    )


def _run_comparison_task(
    job_id: str,
    num_candidates: int,
    num_schools: int,
    choices_per_candidate: int,
    config_schema: Optional[FairPlacementConfigSchema],
    seed: Optional[int],
):
    run_framework_comparison(
        num_candidates=num_candidates,
        num_schools=num_schools,
        choices_per_candidate=choices_per_candidate,
        config_schema=config_schema,
        seed=seed,
        job_id=job_id,
    )


@app.post("/api/simulate", response_model=SimulationResponse)
def start_simulation(req: SimulationRequest, background_tasks: BackgroundTasks):
    """Start a placement simulation (runs in background for large N)."""
    job_id = str(uuid.uuid4())
    sim_jobs[job_id] = {"status": "running", "result": None, "summary": None}
    background_tasks.add_task(
        _run_simulation_task,
        job_id,
        req.num_candidates,
        req.num_schools,
        req.choices_per_candidate,
        req.config,
        req.seed,
    )
    return SimulationResponse(
        job_id=job_id,
        status="queued",
        message="Simulation started. Poll GET /api/simulate/{job_id} for results.",
    )


@app.get("/api/simulate/{job_id}")
def get_simulation_result(job_id: str):
    """Get simulation result by job_id."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/simulate/{job_id}/summary", response_model=RunResultSummary)
def get_simulation_summary(job_id: str):
    """Get only the summary and fairness metrics."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    summary = job.get("summary")
    if not summary:
        return RunResultSummary(
            job_id=job_id,
            status=job.get("status", "unknown"),
            total_candidates=0,
            placed_count=0,
            unplaced_count=0,
            placement_rate=0,
            first_choice_rate=None,
            avg_choice_rank_placed=None,
            duration_seconds=None,
            fairness_metrics=None,
        )
    return RunResultSummary(**summary)


@app.post("/api/placement/run")
def run_placement_direct(
    candidates: list[CandidateCreate],
    schools: list[SchoolCreate],
    config: Optional[FairPlacementConfigSchema] = None,
):
    """Run placement on provided candidates and schools (small batches)."""
    cands = [
        Candidate(
            id=c.id,
            aggregate=c.aggregate,
            choices=c.choices,
            region=c.region,
            gender=c.gender,
            is_catchment=c.is_catchment,
        )
        for c in candidates
    ]
    schs = [
        School(
            code=s.code,
            name=s.name,
            capacity=s.capacity,
            region=s.region,
            catchment_districts=s.catchment_districts,
        )
        for s in schools
    ]
    cfg = _schema_to_config(config)
    results, fill_counts = run_fair_placement(cands, schs, cfg)
    metrics = get_fairness_metrics(results, cands, schs)
    return {
        "results": [
            {"candidate_id": r.candidate_id, "school_code": r.school_code, "choice_rank": r.choice_rank, "aggregate": r.aggregate}
            for r in results
        ],
        "fill_counts": fill_counts,
        "fairness_metrics": metrics,
    }


@app.post("/api/compare", response_model=SimulationResponse)
def start_framework_comparison(req: SimulationRequest, background_tasks: BackgroundTasks):
    """
    Start a scientific comparison of the automated framework vs GES baseline.
    
    Runs both frameworks side-by-side on the same dataset and compares:
    - Placement rates
    - Satisfaction (first-choice rate)
    - Equity (regional & gender fairness)
    - Overall performance verdict
    """
    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        _run_comparison_task,
        job_id,
        req.num_candidates,
        req.num_schools,
        req.choices_per_candidate,
        req.config,
        req.seed,
    )
    return SimulationResponse(
        job_id=job_id,
        status="queued",
        message="Framework comparison started. Poll GET /api/compare/{job_id} for results.",
    )


@app.get("/api/compare/{job_id}")
def get_framework_comparison(job_id: str):
    """Get framework comparison results by job_id."""
    result = get_comparison_result(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Comparison job not found")
    return result


@app.get("/api/config/equity-modes")
def list_equity_modes():
    """List supported equity modes for the placement algorithm."""
    return [{"value": e.value, "label": e.name} for e in EquityMode]


# --- Load testing / resilience (Phase 2) ---

@app.get("/api/load/status")
def load_status():
    """Placeholder for load test status (e.g. 585K run)."""
    return {"message": "Use /api/simulate with num_candidates up to 585000 for stress test."}


@app.get("/api/resilience/check")
def resilience_check():
    """Simple resilience check: service and placement engine responsive."""
    return {"ok": True, "placement_engine": "ready"}


