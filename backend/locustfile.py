"""
Locust load tests for CSSPS API.

Run: locust -f locustfile.py --host=http://localhost:8000
Then open http://localhost:8089 and start a swarm.
"""

import random
from locust import HttpUser, task, between


class CSSPSUser(HttpUser):
    wait_time = between(0.5, 2)

    @task(3)
    def health(self):
        self.client.get("/health")

    @task(2)
    def resilience(self):
        self.client.get("/api/resilience/check")

    @task(1)
    def small_simulation(self):
        self.client.post(
            "/api/simulate",
            json={
                "num_candidates": 500,
                "num_schools": 20,
                "choices_per_candidate": 5,
                "seed": random.randint(1, 99999),
            },
        )
