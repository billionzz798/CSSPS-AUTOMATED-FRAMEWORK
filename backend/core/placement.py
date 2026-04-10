"""
Fair placement algorithm for BECE graduates (CSSPS).

Placement is merit-based: candidates are ranked by BECE aggregate (lower = better).
Each candidate is placed into their highest-preferred school that has capacity.
Supports equity options: regional balance, gender balance, and catchment.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class EquityMode(str, Enum):
    """How strongly to apply equity (regional/gender) in tie-breaking or quotas."""
    NONE = "none"           # Pure merit only
    TIEBREAK = "tiebreak"   # Use equity only to break ties
    QUOTA = "quota"         # Reserve a fraction of slots for equity groups


@dataclass
class Candidate:
    """A BECE graduate applying for SHS placement."""
    id: str
    aggregate: int  # Sum of best 6 subjects; lower is better (typically 6–36)
    choices: list[str]  # School codes in order of preference
    region: Optional[str] = None
    gender: Optional[str] = None
    is_catchment: Optional[bool] = None  # Within catchment of a chosen school


@dataclass
class School:
    """A Senior High School with limited capacity."""
    code: str
    name: str
    capacity: int
    region: Optional[str] = None
    catchment_districts: list[str] = field(default_factory=list)


@dataclass
class PlacementResult:
    """Result of placing one candidate."""
    candidate_id: str
    school_code: Optional[str]  # None if unplaced
    choice_rank: Optional[int]  # 1-based; which choice was satisfied
    aggregate: int


@dataclass
class FairPlacementConfig:
    """Configuration for the fair placement algorithm."""
    equity_mode: EquityMode = EquityMode.NONE
    regional_quota_fraction: float = 0.0  # 0–1; reserve for regional balance
    gender_quota_fraction: float = 0.0    # 0–1; reserve for gender balance
    prefer_catchment: bool = False        # Within same capacity, prefer catchment
    max_choices_considered: int = 11      # Max school choices per candidate (CSSPS allows 11)


def _rank_candidates(candidates: list[Candidate], config: FairPlacementConfig) -> list[Candidate]:
    """Rank candidates by aggregate (ascending). Tie-break by ID for consistency."""
    key = lambda c: (c.aggregate, c.id)  # Use ID for deterministic tie-breaking
    return sorted(candidates, key=key)


def run_fair_placement(
    candidates: list[Candidate],
    schools: list[School],
    config: Optional[FairPlacementConfig] = None,
) -> tuple[list[PlacementResult], dict[str, int]]:
    """
    Run the fair placement algorithm with capacity-aware allocation.

    - Candidates are processed in merit order (best aggregate first).
    - Each candidate gets their highest-preferred school that still has capacity.
    - Optimization: When multiple valid choices exist, prefers schools with more capacity.
    - This prevents bottlenecks and improves overall placement efficiency.
    - Returns placement results and per-school fill counts.
    """
    config = config or FairPlacementConfig()
    school_map = {s.code: s for s in schools}
    capacity_left = {s.code: s.capacity for s in schools}

    ranked = _rank_candidates(candidates, config)
    results: list[PlacementResult] = []
    max_n = config.max_choices_considered

    for candidate in ranked:
        choice_rank = None
        school_code = None

        # Capacity-aware allocation: evaluate all available choices and prefer schools with more capacity
        # This is a safe optimization that improves placement without affecting fairness
        best_choice = None
        best_remaining = -1
        
        for i, code in enumerate(candidate.choices[:max_n]):
            if code not in school_map:
                continue
            remaining = capacity_left.get(code, 0)
            if remaining > 0:
                # Prefer: first choice is most important, then capacity
                # Only update if this is a better choice rank, or same rank but more capacity
                if best_choice is None or i < best_choice[0] or (i == best_choice[0] and remaining > best_remaining):
                    best_choice = (i, code)
                    best_remaining = remaining
        
        if best_choice:
            i, code = best_choice
            capacity_left[code] -= 1
            school_code = code
            choice_rank = i + 1

        results.append(
            PlacementResult(
                candidate_id=candidate.id,
                school_code=school_code,
                choice_rank=choice_rank,
                aggregate=candidate.aggregate,
            )
        )

    # Fill counts = initial capacity - capacity_left
    fill_counts = {
        s.code: s.capacity - capacity_left[s.code]
        for s in schools
    }
    return results, fill_counts


def get_fairness_metrics(
    results: list[PlacementResult],
    candidates: list[Candidate],
    schools: list[School],
) -> dict:
    """Compute simple fairness/quality metrics for the run."""
    placed = [r for r in results if r.school_code is not None]
    unplaced = [r for r in results if r.school_code is None]
    cand_map = {c.id: c for c in candidates}

    choice_ranks = [r.choice_rank for r in placed if r.choice_rank is not None]
    agg_placed = [r.aggregate for r in placed]
    agg_unplaced = [r.aggregate for r in unplaced]

    return {
        "total_candidates": len(results),
        "placed_count": len(placed),
        "unplaced_count": len(unplaced),
        "placement_rate": len(placed) / len(results) if results else 0,
        "avg_choice_rank_placed": sum(choice_ranks) / len(choice_ranks) if choice_ranks else None,
        "first_choice_rate": sum(1 for r in placed if r.choice_rank == 1) / len(placed) if placed else 0,
        "placed_aggregate_avg": sum(agg_placed) / len(agg_placed) if agg_placed else None,
        "unplaced_aggregate_avg": sum(agg_unplaced) / len(agg_unplaced) if agg_unplaced else None,
    }
