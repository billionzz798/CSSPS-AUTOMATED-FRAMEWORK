"""
Real-world test: BECE 2024 placement scenario.

Uses official GES statistics (553,155 qualified, 80.93% auto-placed, 94.20% total placed)
to validate that the framework produces plausible, reliable outcomes.

Run: pytest tests/test_real_world_2024_bece.py -v
"""

import pytest
from services.real_world_demo import run_2024_scenario, BECE_2024


# Official 2024 band: auto-placement 80.93%, overall 94.20%.
# Our algorithm does "auto placement" only (no similar-school offers), so we expect
# placement rate to fall in a band that depends on capacity/choices (e.g. 70–95%).
PLACEMENT_RATE_MIN = 0.65
PLACEMENT_RATE_MAX = 0.98
FIRST_CHOICE_RATE_MIN = 0.10  # At least some get first choice
DURATION_MAX_SECONDS_SMALL = 30  # 5.5k candidates should finish quickly


def test_real_world_2024_small_scale():
    """
    Run 2024-style scenario at 1% scale (~5.5k candidates, 72 schools).
    Asserts placement rate is in a realistic band and algorithm completes quickly.
    """
    _, summary, duration = run_2024_scenario(
        scale=0.01,
        num_schools=72,
        choices_per_candidate=6,
        seed=2024,
    )
    assert summary["num_candidates"] >= 5000
    assert summary["num_schools"] == 72
    assert PLACEMENT_RATE_MIN <= summary["placement_rate"] <= PLACEMENT_RATE_MAX, (
        f"Placement rate {summary['placement_rate']*100:.1f}% outside expected band "
        f"[{PLACEMENT_RATE_MIN*100:.0f}%, {PLACEMENT_RATE_MAX*100:.0f}%]"
    )
    assert summary["first_choice_rate"] >= FIRST_CHOICE_RATE_MIN
    assert duration < DURATION_MAX_SECONDS_SMALL, f"Run took {duration}s (max {DURATION_MAX_SECONDS_SMALL}s)"
    assert summary["placed_count"] + summary["unplaced_count"] == summary["num_candidates"]


def test_real_world_2024_medium_scale():
    """
    Run at 10% scale (~55k candidates). Validates scalability and consistent behaviour.
    """
    _, summary, _ = run_2024_scenario(
        scale=0.10,
        num_schools=200,
        choices_per_candidate=6,
        seed=2024,
    )
    assert summary["num_candidates"] >= 50_000
    assert PLACEMENT_RATE_MIN <= summary["placement_rate"] <= PLACEMENT_RATE_MAX
    assert summary["first_choice_rate"] >= FIRST_CHOICE_RATE_MIN
    assert summary["fairness_metrics"]["total_candidates"] == summary["num_candidates"]


def test_real_world_2024_reproducibility():
    """Same seed and scale must produce identical placement rate."""
    _, s1, _ = run_2024_scenario(scale=0.005, num_schools=50, seed=2024)
    _, s2, _ = run_2024_scenario(scale=0.005, num_schools=50, seed=2024)
    assert s1["placement_rate"] == s2["placement_rate"]
    assert s1["placed_count"] == s2["placed_count"]


def test_official_2024_constants():
    """Ensure we reference correct official statistics."""
    assert BECE_2024["qualified_for_placement"] == 553_155
    assert 0.80 <= BECE_2024["auto_placement_rate"] <= 0.82
    assert 0.93 <= BECE_2024["overall_placement_rate"] <= 0.95
