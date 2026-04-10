"""Tests for the fair placement algorithm."""

import pytest
from core.placement import (
    Candidate,
    School,
    FairPlacementConfig,
    EquityMode,
    run_fair_placement,
    get_fairness_metrics,
)


def test_placement_merit_order():
    """Candidates with better aggregate get priority for same choice."""
    schools = [
        School("S1", "School 1", 2, None),
        School("S2", "School 2", 2, None),
    ]
    # C1 aggregate 10, C2 aggregate 15, C3 aggregate 12. All choose S1 first.
    candidates = [
        Candidate("C1", 10, ["S1", "S2"]),
        Candidate("C2", 15, ["S1", "S2"]),
        Candidate("C3", 12, ["S1", "S2"]),
    ]
    results, fill = run_fair_placement(candidates, schools, None)
    placed = {r.candidate_id: r.school_code for r in results}
    assert placed["C1"] == "S1"
    assert placed["C3"] == "S1"  # second slot at S1
    assert placed["C2"] == "S2"  # S1 full, gets S2
    assert fill["S1"] == 2 and fill["S2"] == 1


def test_placement_respects_choices():
    """Candidate gets first available choice in preference order."""
    schools = [
        School("S1", "School 1", 0),  # full
        School("S2", "School 2", 1),
    ]
    candidates = [Candidate("C1", 10, ["S1", "S2"])]
    results, _ = run_fair_placement(candidates, schools, None)
    assert results[0].school_code == "S2"
    assert results[0].choice_rank == 2


def test_unplaced_when_no_capacity():
    """Candidates with no available choice remain unplaced."""
    schools = [School("S1", "School 1", 1)]
    candidates = [
        Candidate("C1", 10, ["S1"]),
        Candidate("C2", 12, ["S1"]),
    ]
    results, _ = run_fair_placement(candidates, schools, None)
    placed = [r for r in results if r.school_code]
    unplaced = [r for r in results if r.school_code is None]
    assert len(placed) == 1 and len(unplaced) == 1
    assert placed[0].candidate_id == "C1"


def test_fairness_metrics():
    """Fairness metrics are computed correctly."""
    schools = [School("S1", "S1", 2), School("S2", "S2", 2)]
    candidates = [
        Candidate("C1", 8, ["S1", "S2"]),
        Candidate("C2", 9, ["S1", "S2"]),
        Candidate("C3", 10, ["S1", "S2"]),
        Candidate("C4", 11, ["S1", "S2"]),
    ]
    results, _ = run_fair_placement(candidates, schools, None)
    metrics = get_fairness_metrics(results, candidates, schools)
    assert metrics["total_candidates"] == 4
    assert metrics["placed_count"] == 4
    assert metrics["placement_rate"] == 1.0
    assert metrics["first_choice_rate"] == 0.5  # C1,C2 get S1; C3,C4 get S2
