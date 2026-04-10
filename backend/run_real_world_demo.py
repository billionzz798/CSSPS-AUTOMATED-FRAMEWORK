#!/usr/bin/env python3
"""
Run the BECE 2024 real-world demo to demonstrate framework reliability.

Usage (from backend directory):
  PYTHONPATH=. python run_real_world_demo.py           # default: 1% scale, ~5.5k candidates
  PYTHONPATH=. python run_real_world_demo.py --scale 0.1   # 10% scale, ~55k
  PYTHONPATH=. python run_real_world_demo.py --scale 1.0  # full 553k (slow)
"""

import argparse
from services.real_world_demo import run_2024_scenario, print_demo_report


def main():
    p = argparse.ArgumentParser(description="BECE 2024 real-world placement demo")
    p.add_argument("--scale", type=float, default=0.01, help="Scale vs 2024 (1.0 = 553k candidates)")
    p.add_argument("--schools", type=int, default=None, help="Number of schools (default from scenario)")
    p.add_argument("--choices", type=int, default=6, help="Choices per candidate (5-11)")
    p.add_argument("--seed", type=int, default=2024)
    args = p.parse_args()

    _, summary, _ = run_2024_scenario(
        scale=args.scale,
        num_schools=args.schools,
        choices_per_candidate=args.choices,
        seed=args.seed,
    )
    print_demo_report(summary)


if __name__ == "__main__":
    main()
