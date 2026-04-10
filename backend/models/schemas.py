"""Pydantic schemas for API and placement."""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EquityMode(str, Enum):
    NONE = "none"
    TIEBREAK = "tiebreak"
    QUOTA = "quota"


class CandidateCreate(BaseModel):
    id: str
    aggregate: int = Field(ge=6, le=36)
    choices: list[str]
    region: Optional[str] = None
    gender: Optional[str] = None
    is_catchment: Optional[bool] = None


class SchoolCreate(BaseModel):
    code: str
    name: str
    capacity: int = Field(ge=1)
    region: Optional[str] = None
    catchment_districts: list[str] = Field(default_factory=list)


class FairPlacementConfigSchema(BaseModel):
    equity_mode: EquityMode = EquityMode.NONE
    regional_quota_fraction: float = Field(0.0, ge=0, le=1)
    gender_quota_fraction: float = Field(0.0, ge=0, le=1)
    prefer_catchment: bool = False
    max_choices_considered: int = Field(11, ge=1, le=20)


class PlacementResultSchema(BaseModel):
    candidate_id: str
    school_code: Optional[str]
    choice_rank: Optional[int]
    aggregate: int


class SimulationRequest(BaseModel):
    num_candidates: int = Field(1000, ge=1, le=1_000_000)
    num_schools: int = Field(50, ge=1, le=5000)
    choices_per_candidate: int = Field(5, ge=1, le=11)
    config: Optional[FairPlacementConfigSchema] = None
    seed: Optional[int] = None


class SimulationResponse(BaseModel):
    job_id: str
    status: str = "queued"
    message: str = "Simulation started."


class RunResultSummary(BaseModel):
    job_id: str
    status: str
    total_candidates: int
    placed_count: int
    unplaced_count: int
    placement_rate: float
    first_choice_rate: Optional[float]
    avg_choice_rank_placed: Optional[float]
    duration_seconds: Optional[float]
    fairness_metrics: Optional[dict] = None
