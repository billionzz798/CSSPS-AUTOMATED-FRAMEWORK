"""
Real-world BECE 2024 placement scenario for framework validation.

Based on official GES/WAEC statistics:
- 563,399 results received; 553,155 qualified for placement
- 447,698 (80.93%) automatically placed to one of their choices
- 521,088 (94.20%) total placed (auto + similar-school offers)
- 104,918 could not be matched to any choice (self-placement)
- ~721 public SHS/TVET schools in Ghana (GES Selection Register)

This module provides fixed parameters and reproducible data generation
so the framework can be demonstrated against 2024-like outcomes.
"""

# --- Official 2024 BECE placement statistics (source: GES) ---
BECE_2024 = {
    "total_candidates_sat": 569_236,
    "results_received": 563_399,
    "qualified_for_placement": 553_155,
    "auto_placed": 447_698,           # placed to one of their selected choices
    "auto_placement_rate": 0.8093,     # 80.93%
    "placed_similar_school": 73_390,   # offered similar school
    "total_placed": 521_088,
    "overall_placement_rate": 0.9420,  # 94.20%
    "unmatched_to_choices": 104_918,
    "public_shs_count": 721,          # GES SHS Selection Register
}

# Ghana's 16 regions (for realistic distribution)
REGIONS = [
    "Greater Accra", "Ashanti", "Western", "Western North", "Central",
    "Eastern", "Volta", "Oti", "Northern", "Savannah", "North East",
    "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
]


def get_2024_scenario_params(
    scale: float = 1.0,
    num_schools: int | None = None,
    choices_per_candidate: int = 6,
) -> dict:
    """
    Return scenario parameters matching 2024 BECE scale.

    scale: 1.0 = full 553k candidates; 0.1 = 55k (faster run); 0.01 = 5.5k (quick test).
    num_schools: If None, derived from 2024 count; otherwise use this (e.g. 200 for small test).
    choices_per_candidate: 5–11 (CSSPS allows up to 11).
    """
    n_qualified = int(BECE_2024["qualified_for_placement"] * scale)
    n_schools = num_schools if num_schools is not None else BECE_2024["public_shs_count"]
    # Target total capacity so that placement rate can reach ~80–94%.
    # Slightly more capacity than candidates so algorithm can place most.
    total_capacity_target = int(n_qualified * 1.02)
    avg_capacity = max(100, total_capacity_target // n_schools)
    return {
        "num_candidates": n_qualified,
        "num_schools": n_schools,
        "choices_per_candidate": min(11, max(5, choices_per_candidate)),
        "avg_school_capacity": avg_capacity,
        "total_capacity_target": total_capacity_target,
        "seed": 2024,
    }


def school_capacities_2024(num_schools: int, total_capacity: int, seed: int = 2024) -> list[int]:
    """
    Generate school capacities that sum to total_capacity, with realistic variance.
    Some schools are much larger (Category A/B) and many smaller (Category C).
    """
    import random
    random.seed(seed)
    # Rough distribution: ~15% large (300–800), ~30% medium (150–350), ~55% smaller (80–200)
    caps = []
    n_large = int(num_schools * 0.15)
    n_medium = int(num_schools * 0.30)
    n_small = num_schools - n_large - n_medium
    caps.extend(random.randint(300, 800) for _ in range(n_large))
    caps.extend(random.randint(150, 350) for _ in range(n_medium))
    caps.extend(random.randint(80, 200) for _ in range(n_small))
    current = sum(caps)
    # Scale to hit total_capacity
    if current <= 0:
        return [total_capacity // num_schools] * num_schools
    factor = total_capacity / current
    caps = [max(50, int(c * factor)) for c in caps]
    # Adjust for rounding
    diff = total_capacity - sum(caps)
    for i in range(abs(diff)):
        idx = i % num_schools
        caps[idx] += 1 if diff > 0 else -1
        caps[idx] = max(50, caps[idx])
    return caps
