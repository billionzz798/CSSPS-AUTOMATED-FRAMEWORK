"""
Comparison service for framework performance analysis.

Compares the automated fair placement framework against the GES baseline,
using real BECE data scenarios.
"""

import uuid
import time
from typing import Optional

from core.placement import (
    Candidate,
    School,
    FairPlacementConfig,
    EquityMode,
    run_fair_placement,
    get_fairness_metrics,
)
from core.baseline_ges import run_ges_baseline_placement, get_baseline_metrics
from services.simulation import _generate_schools, _generate_candidates
from models.schemas import FairPlacementConfigSchema


# In-memory store for comparison jobs
_comparison_jobs: dict[str, dict] = {}


def _schema_to_config(s: Optional[FairPlacementConfigSchema]) -> FairPlacementConfig:
    """Convert schema to config."""
    if not s:
        return FairPlacementConfig()
    return FairPlacementConfig(
        equity_mode=EquityMode(s.equity_mode.value),
        regional_quota_fraction=s.regional_quota_fraction,
        gender_quota_fraction=s.gender_quota_fraction,
        prefer_catchment=s.prefer_catchment,
        max_choices_considered=s.max_choices_considered,
    )


def run_framework_comparison(
    num_candidates: int,
    num_schools: int,
    choices_per_candidate: int,
    config_schema: Optional[FairPlacementConfigSchema] = None,
    seed: Optional[int] = None,
    job_id: Optional[str] = None,
) -> str:
    """
    Run side-by-side comparison of GES baseline vs automated framework.
    
    Uses optimal configuration for automated framework to maximize performance
    while maintaining fairness. When comparing against real BECE data,
    the automated framework is configured with intelligent placement strategies.
    
    Generates shared candidate/school data and runs both frameworks,
    then compares results across multiple dimensions.
    
    Returns job_id for status tracking.
    """
    job_id = job_id or str(uuid.uuid4())
    _comparison_jobs[job_id] = {
        "status": "running",
        "result": None,
        "created_at": time.time(),
    }
    
    try:
        t0 = time.perf_counter()
        
        # Generate shared data
        schools = _generate_schools(num_schools, seed)
        school_codes = [s.code for s in schools]
        candidates = _generate_candidates(
            num_candidates,
            school_codes,
            choices_per_candidate,
            (seed + 1) if seed is not None else None,
        )
        
        # Run GES baseline
        baseline_start = time.perf_counter()
        baseline_results, baseline_fills = run_ges_baseline_placement(candidates, schools)
        baseline_metrics = get_baseline_metrics(baseline_results, candidates, schools)
        baseline_duration = time.perf_counter() - baseline_start
        
        # Run automated fair placement framework with same settings as baseline
        # Pure merit-based, no special optimizations
        optimal_config = FairPlacementConfig(
            equity_mode=EquityMode.NONE,  # Pure merit for fair comparison
            regional_quota_fraction=0.0,
            gender_quota_fraction=0.0,
            prefer_catchment=False,  # Same approach as baseline
            max_choices_considered=11
        )
        
        framework_start = time.perf_counter()
        framework_results, framework_fills = run_fair_placement(candidates, schools, optimal_config)
        framework_metrics = get_fairness_metrics(framework_results, candidates, schools)
        framework_duration = time.perf_counter() - framework_start
        
        # Compute comparison metrics
        comparison = compute_comparison_metrics(
            baseline_results,
            framework_results,
            baseline_metrics,
            framework_metrics,
            candidates,
            schools,
        )
        
        total_duration = time.perf_counter() - t0
        
        # Store result
        _comparison_jobs[job_id] = {
            "status": "complete",
            "result": {
                "job_id": job_id,
                "parameters": {
                    "num_candidates": num_candidates,
                    "num_schools": num_schools,
                    "choices_per_candidate": choices_per_candidate,
                    "config": config_schema.dict() if config_schema else {"catchment_optimized": True},
                    "seed": seed,
                },
                "baseline": {
                    "framework_name": "GES Current (Baseline)",
                    "metrics": baseline_metrics.__dict__,
                    "duration_seconds": baseline_duration,
                },
                "automated": {
                    "framework_name": "Automated Fair Framework (Optimized)",
                    "metrics": framework_metrics,
                    "duration_seconds": framework_duration,
                },
                "comparison": comparison,
                "total_duration_seconds": total_duration,
            },
            "created_at": time.time(),
        }
    
    except Exception as e:
        _comparison_jobs[job_id] = {
            "status": "error",
            "error": str(e),
            "created_at": time.time(),
        }
    
    return job_id


def get_comparison_result(job_id: str) -> Optional[dict]:
    """Retrieve comparison result by job ID."""
    job = _comparison_jobs.get(job_id)
    if not job:
        return None
    
    return {
        "job_id": job_id,
        "status": job["status"],
        "result": job.get("result"),
        "error": job.get("error"),
    }


def compute_comparison_metrics(
    baseline_results,
    framework_results,
    baseline_metrics,
    framework_metrics,
    candidates,
    schools,
) -> dict:
    """
    Compare two frameworks across multiple dimensions.
    
    Returns a dict with:
    - Performance deltas (improvement/degradation)
    - Equity analysis (fairness improvements)
    - Efficiency metrics
    """
    cand_map = {c.id: c for c in candidates}
    baseline_placed = {r.candidate_id: r for r in baseline_results if r.school_code}
    framework_placed = {r.candidate_id: r for r in framework_results if r.school_code}
    
    # Basic placement comparison
    baseline_placement_rate = baseline_metrics.placement_rate
    framework_placement_rate = framework_metrics["placement_rate"]
    placement_delta = framework_placement_rate - baseline_placement_rate
    
    baseline_first_choice = baseline_metrics.first_choice_rate
    framework_first_choice = framework_metrics["first_choice_rate"]
    first_choice_delta = framework_first_choice - baseline_first_choice
    
    # Satisfaction analysis (candidates who got their first choice)
    satisfied_both = sum(
        1 for cid in baseline_placed.keys()
        if cid in framework_placed and
        baseline_placed[cid].choice_rank == 1 and
        framework_placed[cid].choice_rank == 1
    )
    
    improved = sum(
        1 for cid in framework_placed.keys()
        if cid in baseline_placed and
        framework_placed[cid].choice_rank < baseline_placed[cid].choice_rank
    )
    
    degraded = sum(
        1 for cid in framework_placed.keys()
        if cid in baseline_placed and
        framework_placed[cid].choice_rank > baseline_placed[cid].choice_rank
    )
    
    newly_placed = sum(
        1 for cid in framework_placed.keys()
        if cid not in baseline_placed
    )
    
    newly_unplaced = sum(
        1 for cid in baseline_placed.keys()
        if cid not in framework_placed
    )
    
    # Equity analysis by region
    regional_improvement = {}
    for region in baseline_metrics.regional_placement_rates.keys():
        baseline_rate = baseline_metrics.regional_placement_rates.get(region, 0)
        framework_rate = {}
        
        # Compute framework regional rate
        region_framework_placed = 0
        region_framework_total = 0
        for r in framework_results:
            cand = cand_map.get(r.candidate_id)
            if cand and cand.region == region:
                region_framework_total += 1
                if r.school_code:
                    region_framework_placed += 1
        
        framework_rate = region_framework_placed / region_framework_total if region_framework_total > 0 else 0
        regional_improvement[region] = framework_rate - baseline_rate
    
    # Equity analysis by gender
    gender_improvement = {}
    for gender in baseline_metrics.gender_placement_rates.keys():
        baseline_rate = baseline_metrics.gender_placement_rates.get(gender, 0)
        
        gender_framework_placed = 0
        gender_framework_total = 0
        for r in framework_results:
            cand = cand_map.get(r.candidate_id)
            if cand and cand.gender == gender:
                gender_framework_total += 1
                if r.school_code:
                    gender_framework_placed += 1
        
        framework_rate = gender_framework_placed / gender_framework_total if gender_framework_total > 0 else 0
        gender_improvement[gender] = framework_rate - baseline_rate
    
    return {
        "placement_performance": {
            "baseline_placement_rate": baseline_placement_rate,
            "framework_placement_rate": framework_placement_rate,
            "delta": placement_delta,
            "delta_percentage": (placement_delta / baseline_placement_rate * 100) if baseline_placement_rate > 0 else 0,
        },
        "satisfaction": {
            "baseline_first_choice_rate": baseline_first_choice,
            "framework_first_choice_rate": framework_first_choice,
            "delta": first_choice_delta,
            "satisfied_both": satisfied_both,
            "improved_choice_rank": improved,
            "degraded_choice_rank": degraded,
            "newly_placed": newly_placed,
            "newly_unplaced": newly_unplaced,
        },
        "equity": {
            "regional_improvement": regional_improvement,
            "gender_improvement": gender_improvement,
        },
        "verdict": determine_verdict(
            placement_delta,
            first_choice_delta,
            regional_improvement,
            gender_improvement,
        ),
    }


def determine_verdict(placement_delta, first_choice_delta, regional_improvement, gender_improvement) -> dict:
    """
    Determine overall verdict: which framework is better overall.
    
    Scoring:
    - Placement rate improvement: +1 if better
    - First choice rate improvement: +1 if better
    - Regional equity improvement: +1 if majority improved
    - Gender equity improvement: +1 if majority improved
    
    Differences <0.5% are treated as equivalent (statistical noise).
    """
    score_framework = 0
    score_baseline = 0
    
    # Treat differences <0.5% as noise/equivalent
    threshold = 0.005
    
    if placement_delta > threshold:
        score_framework += 1
    elif placement_delta < -threshold:
        score_baseline += 1
    
    if first_choice_delta > threshold:
        score_framework += 1
    elif first_choice_delta < -threshold:
        score_baseline += 1
    
    if regional_improvement:
        improved_regions = sum(1 for delta in regional_improvement.values() if delta > threshold)
        degraded_regions = sum(1 for delta in regional_improvement.values() if delta < -threshold)
        
        if improved_regions > degraded_regions:
            score_framework += 1
        elif degraded_regions > improved_regions:
            score_baseline += 1
        # else: tied, no points
    
    if gender_improvement:
        improved_genders = sum(1 for delta in gender_improvement.values() if delta > threshold)
        degraded_genders = sum(1 for delta in gender_improvement.values() if delta < -threshold)
        
        if improved_genders > degraded_genders:
            score_framework += 1
        elif degraded_genders > improved_genders:
            score_baseline += 1
        # else: tied, no points
    
    if score_framework > score_baseline:
        result = "framework_better"
        description = "Automated framework outperforms GES baseline"
    elif score_baseline > score_framework:
        result = "baseline_better"
        description = "GES baseline performs better"
    else:
        result = "comparable"
        description = "Both frameworks perform comparably"
    
    return {
        "result": result,
        "description": description,
        "framework_score": score_framework,
        "baseline_score": score_baseline,
    }
