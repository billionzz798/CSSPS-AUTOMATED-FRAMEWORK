"""Placement simulation runner with synthetic data generation."""

import random
import time
import uuid
from typing import Optional

from core.placement import (
    Candidate,
    School,
    FairPlacementConfig,
    EquityMode,
    run_fair_placement,
    get_fairness_metrics,
)
from models.schemas import FairPlacementConfigSchema


# In-memory job store for demo; use Redis/DB in production
_jobs: dict[str, dict] = {}


def _schema_to_config(s: Optional[FairPlacementConfigSchema]) -> FairPlacementConfig:
    if not s:
        return FairPlacementConfig()
    return FairPlacementConfig(
        equity_mode=EquityMode(s.equity_mode.value),
        regional_quota_fraction=s.regional_quota_fraction,
        gender_quota_fraction=s.gender_quota_fraction,
        prefer_catchment=s.prefer_catchment,
        max_choices_considered=s.max_choices_considered,
    )


def _generate_schools(n: int, seed: Optional[int] = None) -> list[School]:
    if seed is not None:
        random.seed(seed)
    # All 16 Ghana regions for realistic distribution
    regions = [
        "Greater Accra", "Ashanti", "Western", "Western North", "Central",
        "Eastern", "Volta", "Oti", "Northern", "Savannah", "North East",
        "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
    ]
    schools = []
    for i in range(n):
        code = f"S{i+1:04d}"
        region = random.choice(regions)
        # Realistic distribution: ~15% large (300-800), ~30% medium (150-350), ~55% small (80-200)
        rand_val = random.random()
        if rand_val < 0.15:
            capacity = random.randint(300, 800)  # Category A/B
        elif rand_val < 0.45:
            capacity = random.randint(150, 350)  # Category C
        else:
            capacity = random.randint(80, 200)   # Category D/smaller
        
        schools.append(School(code=code, name=f"School {code} ({region})", capacity=capacity, region=region))
    return schools


def _generate_candidates(
    n: int,
    school_codes: list[str],
    choices_per_candidate: int,
    seed: Optional[int] = None,
) -> list[Candidate]:
    if seed is not None:
        random.seed(seed)
    # All 16 Ghana regions for realistic distribution
    regions = [
        "Greater Accra", "Ashanti", "Western", "Western North", "Central",
        "Eastern", "Volta", "Oti", "Northern", "Savannah", "North East",
        "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
    ]
    genders = ["M", "F"]
    candidates = []
    for i in range(n):
        # Aggregate: lower is better; realistic skew (most in 10–25)
        # Using better distribution to match BECE: mean around 14-16
        raw = random.gammavariate(2.5, 4.2) + 6  # Better calibrated for BECE
        aggregate = min(36, max(6, int(raw)))
        
        region = random.choice(regions)
        gender = random.choice(genders)
        
        # Candidates have varying numbers of choices (realistic)
        num_choices = min(choices_per_candidate, random.randint(3, 11))
        choices = random.sample(school_codes, min(num_choices, len(school_codes)))
        
        # ~25% in catchment (realistic for Ghana)
        is_catchment = random.random() < 0.25
        
        candidates.append(
            Candidate(
                id=f"C{i+1:07d}",
                aggregate=aggregate,
                choices=choices,
                region=region,
                gender=gender,
                is_catchment=is_catchment,
            )
        )
    return candidates


def run_simulation(
    num_candidates: int,
    num_schools: int,
    choices_per_candidate: int,
    config_schema: Optional[FairPlacementConfigSchema] = None,
    seed: Optional[int] = None,
    job_id: Optional[str] = None,
) -> str:
    """Generate data, run placement, store result. Returns job_id."""
    job_id = job_id or str(uuid.uuid4())
    _jobs[job_id] = {"status": "running", "result": None, "summary": None}

    try:
        t0 = time.perf_counter()
        schools = _generate_schools(num_schools, seed)
        school_codes = [s.code for s in schools]
        candidates = _generate_candidates(num_candidates, school_codes, choices_per_candidate, (seed + 1) if seed is not None else None)
        config = _schema_to_config(config_schema)
        results, fill_counts = run_fair_placement(candidates, schools, config)
        metrics = get_fairness_metrics(results, candidates, schools)
        duration = time.perf_counter() - t0

        placed = [r for r in results if r.school_code]
        first_choice = sum(1 for r in placed if r.choice_rank == 1)
        choice_ranks = [r.choice_rank for r in placed if r.choice_rank]

        summary = {
            "job_id": job_id,
            "status": "completed",
            "total_candidates": len(results),
            "placed_count": len(placed),
            "unplaced_count": len(results) - len(placed),
            "placement_rate": len(placed) / len(results) if results else 0,
            "first_choice_rate": first_choice / len(placed) if placed else 0,
            "avg_choice_rank_placed": sum(choice_ranks) / len(choice_ranks) if choice_ranks else None,
            "duration_seconds": round(duration, 3),
            "fairness_metrics": metrics,
        }

        _jobs[job_id] = {
            "status": "completed",
            "result": [
                {"candidate_id": r.candidate_id, "school_code": r.school_code, "choice_rank": r.choice_rank, "aggregate": r.aggregate}
                for r in results
            ],
            "summary": summary,
            "fill_counts": fill_counts,
        }
    except Exception as e:
        _jobs[job_id] = {"status": "failed", "error": str(e), "result": None, "summary": None}

    return job_id


def get_job(job_id: str) -> Optional[dict]:
    return _jobs.get(job_id)
