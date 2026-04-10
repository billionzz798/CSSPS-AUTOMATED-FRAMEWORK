"""
GES baseline framework - simulates the current CSSPS placement approach.

The baseline represents the current placement mechanism used by GES:
- Pure merit-based placement (by BECE aggregate only)
- First-come-first-served within merit order
- No equity considerations or advanced fairness measures
- Simple allocation to candidate's highest-preference school with capacity
"""

from dataclasses import dataclass
from typing import Optional

from core.placement import Candidate, School, PlacementResult


@dataclass
class BaselineMetrics:
    """Metrics for GES baseline framework."""
    total_candidates: int
    placed_count: int
    unplaced_count: int
    placement_rate: float
    first_choice_rate: float
    avg_choice_rank_placed: Optional[float]
    placed_aggregate_avg: Optional[float]
    unplaced_aggregate_avg: Optional[float]
    regional_placement_rates: dict[str, float]  # by region
    gender_placement_rates: dict[str, float]     # by gender
    choice_distribution: dict[int, int]          # choice rank -> count
    school_oversubscription_rate: float          # % of schools at capacity


def run_ges_baseline_placement(
    candidates: list[Candidate],
    schools: list[School],
) -> tuple[list[PlacementResult], dict[str, int]]:
    """
    Run the GES baseline placement algorithm.
    
    Current GES approach:
    - Rank candidates purely by BECE aggregate (no equity tie-breaking)
    - Process in merit order
    - Allocate to highest-preference school that has capacity
    - No quota system or catchment preferences
    
    Returns:
        - Placement results
        - School fill counts
    """
    school_map = {s.code: s for s in schools}
    capacity_left = {s.code: s.capacity for s in schools}
    
    # Rank by aggregate only (pure merit, no equity adjustments)
    ranked = sorted(candidates, key=lambda c: c.aggregate)
    results: list[PlacementResult] = []
    
    for candidate in ranked:
        placed = False
        choice_rank = None
        school_code = None
        
        # Try each of their choices (up to 11)
        for i, code in enumerate(candidate.choices[:11]):
            if code not in school_map or capacity_left.get(code, 0) <= 0:
                continue
            
            # Place in this school
            capacity_left[code] -= 1
            school_code = code
            choice_rank = i + 1
            placed = True
            break
        
        results.append(
            PlacementResult(
                candidate_id=candidate.id,
                school_code=school_code,
                choice_rank=choice_rank,
                aggregate=candidate.aggregate,
            )
        )
    
    # Fill counts
    fill_counts = {
        s.code: s.capacity - capacity_left[s.code]
        for s in schools
    }
    
    return results, fill_counts


def get_baseline_metrics(
    results: list[PlacementResult],
    candidates: list[Candidate],
    schools: list[School],
) -> BaselineMetrics:
    """Compute comprehensive metrics for GES baseline framework."""
    placed = [r for r in results if r.school_code is not None]
    unplaced = [r for r in results if r.school_code is None]
    cand_map = {c.id: c for c in candidates}
    school_map = {s.code: s for s in schools}
    
    # Basic stats
    choice_ranks = [r.choice_rank for r in placed if r.choice_rank is not None]
    agg_placed = [r.aggregate for r in placed]
    agg_unplaced = [r.aggregate for r in unplaced]
    
    placement_rate = len(placed) / len(results) if results else 0
    first_choice_rate = sum(1 for r in placed if r.choice_rank == 1) / len(placed) if placed else 0
    avg_choice_rank = sum(choice_ranks) / len(choice_ranks) if choice_ranks else None
    
    # Regional breakdown
    regional_placed = {}
    regional_total = {}
    for r in results:
        cand = cand_map.get(r.candidate_id)
        if cand and cand.region:
            region = cand.region
            regional_total[region] = regional_total.get(region, 0) + 1
            if r.school_code is not None:
                regional_placed[region] = regional_placed.get(region, 0) + 1
    
    regional_placement_rates = {
        region: regional_placed.get(region, 0) / total
        for region, total in regional_total.items()
    } if regional_total else {}
    
    # Gender breakdown
    gender_placed = {}
    gender_total = {}
    for r in results:
        cand = cand_map.get(r.candidate_id)
        if cand and cand.gender:
            gender = cand.gender
            gender_total[gender] = gender_total.get(gender, 0) + 1
            if r.school_code is not None:
                gender_placed[gender] = gender_placed.get(gender, 0) + 1
    
    gender_placement_rates = {
        gender: gender_placed.get(gender, 0) / total
        for gender, total in gender_total.items()
    } if gender_total else {}
    
    # Choice distribution
    choice_distribution = {}
    for r in placed:
        if r.choice_rank:
            choice_distribution[r.choice_rank] = choice_distribution.get(r.choice_rank, 0) + 1
    
    # School oversubscription
    school_fills = {}
    for r in placed:
        if r.school_code:
            school_fills[r.school_code] = school_fills.get(r.school_code, 0) + 1
    
    at_capacity = sum(
        1 for code, count in school_fills.items()
        if school_map.get(code) and count >= school_map[code].capacity
    )
    oversubscription_rate = at_capacity / len(schools) if schools else 0
    
    return BaselineMetrics(
        total_candidates=len(results),
        placed_count=len(placed),
        unplaced_count=len(unplaced),
        placement_rate=placement_rate,
        first_choice_rate=first_choice_rate,
        avg_choice_rank_placed=avg_choice_rank,
        placed_aggregate_avg=sum(agg_placed) / len(agg_placed) if agg_placed else None,
        unplaced_aggregate_avg=sum(agg_unplaced) / len(agg_unplaced) if agg_unplaced else None,
        regional_placement_rates=regional_placement_rates,
        gender_placement_rates=gender_placement_rates,
        choice_distribution=choice_distribution,
        school_oversubscription_rate=oversubscription_rate,
    )
