"""
Run a real-world BECE 2024-style placement and return results for demo/validation.

Used by pytest real-world test and by the CLI demo script.
"""

import random
import time
from typing import Optional

from core.placement import (
    Candidate,
    School,
    FairPlacementConfig,
    run_fair_placement,
    get_fairness_metrics,
)
from data.bece_2024_scenario import (
    BECE_2024,
    REGIONS,
    get_2024_scenario_params,
    school_capacities_2024,
)


def generate_2024_style_candidates(
    n: int,
    school_codes: list[str],
    choices_per_candidate: int,
    seed: int = 2024,
) -> list[Candidate]:
    """Generate candidates with 2024-like aggregate distribution and regional/gender mix."""
    random.seed(seed)
    # 2024: 282,703 M and 286,533 F (roughly 50/50)
    genders = ["M", "F"]
    candidates = []
    for i in range(n):
        # Realistic BECE aggregate: most in 10–28, some 6–9 (best), some 29–36 (weaker)
        r = random.random()
        if r < 0.15:
            aggregate = random.randint(6, 10)
        elif r < 0.70:
            aggregate = random.randint(11, 22)
        else:
            aggregate = random.randint(23, 36)
        aggregate = min(36, max(6, aggregate))
        choices = random.sample(school_codes, min(choices_per_candidate, len(school_codes)))
        region = random.choice(REGIONS)
        gender = random.choice(genders)
        candidates.append(
            Candidate(
                id=f"BECE2024-{i+1:07d}",
                aggregate=aggregate,
                choices=choices,
                region=region,
                gender=gender,
                is_catchment=random.random() < 0.18,
            )
        )
    return candidates


def run_2024_scenario(
    scale: float = 0.01,
    num_schools: Optional[int] = None,
    choices_per_candidate: int = 6,
    seed: int = 2024,
) -> tuple[list, dict, float]:
    """
    Run placement with 2024 BECE-like parameters.

    scale: 1.0 = full 553k (slow); 0.1 = 55k; 0.01 = 5.5k (quick).
    Returns (results_list, summary_dict, duration_seconds).
    """
    params = get_2024_scenario_params(scale=scale, num_schools=num_schools, choices_per_candidate=choices_per_candidate)
    n_candidates = params["num_candidates"]
    n_schools = params["num_schools"]
    total_cap = params["total_capacity_target"]
    caps = school_capacities_2024(n_schools, total_cap, seed=seed)

    schools = []
    for i in range(n_schools):
        region = REGIONS[i % len(REGIONS)]
        code = f"GES{i+1:04d}"
        schools.append(School(code=code, name=f"SHS {code} ({region})", capacity=caps[i], region=region))
    school_codes = [s.code for s in schools]

    candidates = generate_2024_style_candidates(
        n_candidates, school_codes, params["choices_per_candidate"], seed=seed + 1
    )

    t0 = time.perf_counter()
    results, fill_counts = run_fair_placement(candidates, schools, FairPlacementConfig(max_choices_considered=11))
    duration = time.perf_counter() - t0
    metrics = get_fairness_metrics(results, candidates, schools)

    placed = [r for r in results if r.school_code is not None]
    first_choice = sum(1 for r in placed if r.choice_rank == 1)
    choice_ranks = [r.choice_rank for r in placed if r.choice_rank]

    summary = {
        "scenario": "BECE 2024 style",
        "scale": scale,
        "num_candidates": n_candidates,
        "num_schools": n_schools,
        "total_capacity": sum(caps),
        "placed_count": len(placed),
        "unplaced_count": len(results) - len(placed),
        "placement_rate": len(placed) / len(results) if results else 0,
        "first_choice_count": first_choice,
        "first_choice_rate": first_choice / len(placed) if placed else 0,
        "avg_choice_rank_placed": sum(choice_ranks) / len(choice_ranks) if choice_ranks else None,
        "duration_seconds": round(duration, 3),
        "fairness_metrics": metrics,
        "official_2024_auto_placement_rate": BECE_2024["auto_placement_rate"],
        "official_2024_overall_placement_rate": BECE_2024["overall_placement_rate"],
    }
    return results, summary, duration


def print_demo_report(summary: dict) -> None:
    """Print a comparison report vs official 2024 statistics."""
    print("\n" + "=" * 60)
    print("  REAL-WORLD DEMO: BECE 2024 STYLE PLACEMENT")
    print("  CSSPS Automated Testing Framework – Reliability Demo")
    print("=" * 60)
    print(f"\n  Scenario scale: {summary['scale']} (1.0 = full 553,155 candidates)")
    print(f"  Candidates:     {summary['num_candidates']:,}")
    print(f"  Schools:        {summary['num_schools']:,}")
    print(f"  Total capacity: {summary['total_capacity']:,}")
    print(f"  Runtime:        {summary['duration_seconds']} s")
    print()
    print("  RESULTS (this run)")
    print("  -----------------")
    print(f"  Placed:         {summary['placed_count']:,}")
    print(f"  Unplaced:       {summary['unplaced_count']:,}")
    print(f"  Placement rate: {summary['placement_rate']*100:.2f}%")
    print(f"  First choice:   {summary['first_choice_rate']*100:.1f}% of placed")
    print()
    print("  OFFICIAL 2024 BECE (GES)")
    print("  -----------------------")
    print(f"  Auto-placement rate:  {summary['official_2024_auto_placement_rate']*100:.2f}%")
    print(f"  Overall placed rate:  {summary['official_2024_overall_placement_rate']*100:.2f}%")
    print()
    print("  Framework placement rate should fall in the same band as")
    print("  official CSSPS (roughly 80–94%) when capacity and choices")
    print("  are set similarly – demonstrating reliable behaviour.")
    print("=" * 60 + "\n")
