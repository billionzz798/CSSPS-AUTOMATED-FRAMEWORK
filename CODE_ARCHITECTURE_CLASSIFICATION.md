# Code Architecture & AI Classification

**Project:** CSSPS Automated Testing Framework  
**Framework:** Python FastAPI (Backend) + React/TypeScript (Frontend)  
**Classification Standard:** AI-only files are boilerplate/tangential; student core files are algorithm/logic

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           React Frontend (Port 5173)                 │
├─────────────────────────────────────────────────────┤
│  Pages: Dashboard | Simulation | LoadTest | Result  │
│         Compare | ComparisonResults                  │
├─────────────────────────────────────────────────────┤
│           API Client (TypeScript)                    │
├─────────────────────────────────────────────────────┤
│      FastAPI Backend (Port 8000)                    │
├─────────────────────────────────────────────────────┤
│  Services: Placement | Simulation | Real World Demo │
├─────────────────────────────────────────────────────┤
│  Core: Placement Algorithm | GES Baseline           │
├─────────────────────────────────────────────────────┤
│  Data: BECE Scenarios | Candidate/School Models    │
├─────────────────────────────────────────────────────┤
│  Testing: Placement Tests | Real World Validation   │
└─────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Layer 1: Core Algorithm (🔴 STUDENT CORE - Not Negotiable)

#### `backend/core/placement.py`
**Classification:** STUDENT CORE ✓

**What It Does:**
Implements the fair placement matching algorithm that assigns 590K+ BECE candidates to schools based on:
- BECE aggregate score (merit)
- Student school choices (preferences)
- School capacity constraints
- Configurable equity options (regional fairness)

**Key Functions:**
- `place_candidates()` — Main placement engine
- `calculate_equity_metrics()` — Fairness analysis across regions
- `validate_placement()` — Integrity checking
- Merit-based sorting and capacity-aware matching

**Why Student Core:**
This is the heart of the framework. Implements the novel fair matching algorithm that validates CSSPS. Student designed the algorithm logic, optimization strategy, and equity calculations.

**Line Count:** ~500 lines  
**Complexity:** High (matching algorithm, equity analysis, validation)

---

### Layer 2: Business Services (🟠 STUDENT CORE - Core Functionality)

#### `backend/services/simulation.py`
**Classification:** STUDENT CORE ✓

**What It Does:**
Orchestrates placement simulations:
- Generates synthetic candidate/school datasets (configurable size)
- Runs placement algorithm with timing/metrics collection
- Calculates performance metrics (placement rate, satisfaction, equity)
- Supports large-scale testing (up to 590K candidates)

**Key Functions:**
- `run_simulation()` — Execute placement with metrics
- `generate_candidate_pool()` — Create test dataset
- `calculate_placement_metrics()` — Performance analysis
- Comparison orchestration

**Why Student Core:**
Defines how the placement algorithm is tested and validated. Student designed the simulation strategy, metrics collection, and comparative testing approach.

**Line Count:** ~400 lines  
**Complexity:** High (test orchestration, metrics calculation, data generation)

---

#### `backend/services/real_world_demo.py`
**Classification:** STUDENT CORE ✓

**What It Does:**
Validates framework against real BECE 2024/2025 data:
- Loads official BECE candidate/school data
- Runs placement algorithm on real scale (590K+ candidates, 724 schools)
- Compares results against GES baseline (83% placement rate)
- Provides validation that framework matches production behavior

**Key Functions:**
- `run_real_world_scenario()` — Execute with real data
- `load_bece_data()` — Import official datasets
- `compare_with_baseline()` — Validation against GES results
- Performance reporting

**Why Student Core:**
Real-world validation is critical to proving framework correctness. Student designed the validation strategy and integrated actual BECE data.

**Line Count:** ~300 lines  
**Complexity:** Medium-High (data integration, validation logic)

---

### Layer 3: Data Models (🟡 AI+ME - Structure with Student Logic)

#### `backend/models/schemas.py`
**Classification:** AI+ME 🤝

**What It Does:**
Defines data structures for the API:
- `Candidate` — Student attributes (BECE score, choices, region)
- `School` — School attributes (capacity, region, type)
- `PlacementResult` — Output structure
- `EquityMetrics` — Fairness analysis results
- `SimulationConfig` — Test configuration parameters

**Key Classes:**
- Pydantic models for input validation
- Response schemas for API endpoints
- Configuration dataclasses

**Why AI+ME:**
Structure is defined by student's algorithm requirements, but schema syntax/implementation can be AI-assisted boilerplate. Student understands what data flows through the system.

**Line Count:** ~150 lines  
**Complexity:** Low (data structure definitions)

---

#### `backend/data/bece_2024_scenario.py`
**Classification:** STUDENT CORE ✓

**What It Does:**
Encodes actual BECE 2024 placement scenario:
- 553,155 candidates
- 721 schools across 16 Ghana regions
- Real choice distributions and capacity data
- Baseline GES placement results (80.93% rate, 70.5% first-choice)

**Key Data:**
- Candidate demographics and BECE score distributions
- School capacity by region and type
- Choice patterns (5-11 choices per candidate)
- Regional distribution (16 administrative regions)

**Why Student Core:**
Student sourced and structured real BECE data. Understanding this data and how it validates the framework is core to the work.

**Line Count:** ~250 lines  
**Complexity:** Medium (data organization, validation context)

---

### Layer 4: API Endpoints (🟡 AI+ME - Framework Generated)

#### `backend/main.py`
**Classification:** AI+ME 🤝

**What It Does:**
FastAPI application setup:
- Endpoint configuration (GET/POST routes)
- Request/response handling
- CORS setup for frontend communication
- API documentation generation

**Endpoints:**
- `POST /simulate` — Run placement simulation
- `POST /compare` — Run comparative analysis
- `POST /load-test` — Stress testing
- `GET /health` — System health check
- `GET /metrics` — Framework performance metrics

**Why AI+ME:**
Endpoint wiring is boilerplate FastAPI code. Student understands what each endpoint does and what data flows through, but implementation scaffolding can be generated.

**Line Count:** ~250 lines  
**Complexity:** Low (endpoint definitions, framework setup)

---

### Layer 5: Testing (🟠 STUDENT CORE - Validation Strategy)

#### `backend/tests/test_placement.py`
**Classification:** STUDENT CORE ✓

**What It Does:**
Unit tests for placement algorithm:
- Tests merit-based ranking correctness
- Validates capacity constraints are enforced
- Verifies equity metrics calculation
- Tests edge cases (more students than capacity, conflicting preferences)

**Key Tests:**
- `test_placement_respects_merit()` — Scores correctly ordered
- `test_capacity_constraints()` — Schools never exceed capacity
- `test_equity_metrics()` — Fairness calculations correct
- `test_large_scale()` — Performance with 590K candidates

**Why Student Core:**
Student designed the test cases to validate algorithm correctness. Testing strategy reflects understanding of edge cases and validation requirements.

**Line Count:** ~200 lines  
**Complexity:** Medium (comprehensive test coverage)

---

#### `backend/tests/test_real_world_2024_bece.py`
**Classification:** STUDENT CORE ✓

**What It Does:**
Integration tests using real BECE 2024 data:
- Runs framework on actual 553K candidate dataset
- Compares results against known GES baseline (80.93% placement)
- Validates framework placement rate is within tolerance (±0.5%)
- Produces detailed comparison report

**Key Tests:**
- `test_placement_rate_matches_baseline()` — ±0.5% tolerance
- `test_regional_distribution()` — Equity across 16 regions
- `test_school_capacity_respected()` — No school over capacity
- `test_real_world_performance()` — Large-scale execution

**Why Student Core:**
This validates the entire framework. Student designed what "comparable" means and how to verify it against production.

**Line Count:** ~250 lines  
**Complexity:** High (real-world validation, comprehensive metrics)

---

## Frontend Architecture

### Layer 1: API Communication (🟡 AI+ME - Integration Code)

#### `frontend/src/api/client.ts`
**Classification:** AI+ME 🤝

**What It Does:**
TypeScript API client for backend communication:
- HTTP request wrapper (axios/fetch)
- Endpoint method definitions
- Response type definitions
- Error handling

**Key Methods:**
- `runSimulation()` — POST to /simulate
- `compareFrameworks()` — POST to /compare
- `runLoadTest()` — POST to /load-test
- `getMetrics()` — GET /metrics

**Why AI+ME:**
API client is boilerplate communication code. Student understands what data is sent/received, but implementation scaffolding is standard.

**Line Count:** ~150 lines  
**Complexity:** Low (HTTP wrapper, type definitions)

---

### Layer 2: Components (🟡 AI+ME - UI Framework)

#### `frontend/src/components/Layout.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
Main layout wrapper component:
- Navigation header with page links
- Sidebar or top navigation
- Content area layout
- Responsive design structure

**Why AI+ME:**
Layout component is UI structure boilerplate. Student understands the page structure and navigation flow, but exact implementation is standard React.

**Line Count:** ~200 lines  
**Complexity:** Low (layout structure)

---

### Layer 3: Pages (🟡 AI+ME to 🔴 STUDENT CORE - Depends on Content)

#### `frontend/src/pages/Dashboard.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
Main landing page showing:
- Framework overview and purpose
- Key statistics (590K candidates, 724 schools, 16 regions)
- Feature cards (Simulation, Load Test, Compare, Real-World Demo)
- Navigation to other pages

**Why AI+ME:**
Dashboard is informational UI with styling applied. Student understands framework overview, but exact page layout is UI boilerplate.

**Line Count:** ~250 lines  
**Complexity:** Low (presentation layer)

---

#### `frontend/src/pages/Simulation.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
Interface for running placement simulations:
- Form inputs (candidate count, schools, choices, random seed)
- "Run simulation" button
- Calls backend simulation endpoint
- Displays results

**Why AI+ME:**
Form interface is UI boilerplate. Student understands what simulation does, but form layout is standard React.

**Line Count:** ~300 lines  
**Complexity:** Medium (form handling, API integration)

---

#### `frontend/src/pages/LoadTest.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
Interface for load/stress testing:
- System health checks
- Load test configuration
- Real-time metrics display
- Portal resilience validation

**Why AI+ME:**
Testing UI is boilerplate. Student understands load testing purpose, but implementation is standard.

**Line Count:** ~280 lines  
**Complexity:** Medium (metrics display, real-time updates)

---

#### `frontend/src/pages/Result.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
Displays simulation results:
- Placement metrics (rate, first-choice rate, unplaced count)
- Performance statistics
- Results table
- Download results option

**Why AI+ME:**
Results display is presentation layer. Student understands what metrics mean, but UI rendering is standard React.

**Line Count:** ~350 lines  
**Complexity:** Medium (data rendering, tables)

---

#### `frontend/src/pages/Compare.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
Interface for comparative analysis:
- Form for configuring comparison scenarios
- Runs framework vs. GES baseline
- Calls comparison endpoint
- Navigates to comparison results

**Why AI+ME:**
Comparison form is UI boilerplate. Student understands comparison logic, but form is standard.

**Line Count:** ~250 lines  
**Complexity:** Medium (form handling, scenario config)

---

#### `frontend/src/pages/ComparisonResults.tsx`
**Classification:** STUDENT CORE ✓

**What It Does:**
Displays detailed comparison analysis:
- Side-by-side framework vs. GES baseline metrics
- Placement performance comparison
- Satisfaction metrics (first-choice placement)
- Equity analysis (regional distribution)
- Verdict statement (comparable? why?)

**Why Student Core:**
This page embodies the validation strategy. Student designed:
- What metrics to compare
- How to visualize comparison
- Information architecture (data first, verdict last)
- What constitutes "comparable"

**Line Count:** ~400 lines  
**Complexity:** High (data analysis visualization, comparison logic)

---

### Layer 4: Styling (🟢 AI-ONLY - Boilerplate Theme)

#### `frontend/src/index.css`
**Classification:** AI-ONLY ✅

**What It Does:**
Global CSS styling:
- CSS variables (colors, spacing, typography)
- Bright Ghana education theme (#f8fafc, #006A3D, #ffffff)
- Component base styles
- Responsive design utilities

**Why AI-Only:**
Styling is pure boilerplate. No functional logic, only color/design values. Student knows: "We use CSS variables for theming and applied bright Ghana education colors."

**Line Count:** ~200 lines  
**Complexity:** None (CSS values)

---

#### `frontend/src/App.tsx` & `frontend/src/main.tsx`
**Classification:** AI+ME 🤝

**What It Does:**
React app entry point and routing:
- Router configuration
- Page mounting
- Root component

**Why AI+ME:**
App setup is boilerplate React. Student understands routing structure but implementation is standard.

**Line Count:** ~100 lines  
**Complexity:** Low (routing setup)

---

## Configuration Files (🟢 AI-ONLY - Infrastructure)

| File | Classification | What It Does | Student Should Know |
|------|----------------|-------------|-------------------|
| `frontend/package.json` | AI-ONLY | NPM dependencies (React, Vite, TypeScript, Axios) | Dependencies needed for frontend build |
| `frontend/tsconfig.json` | AI-ONLY | TypeScript compiler configuration | Project uses TypeScript with strict mode |
| `frontend/vite.config.ts` | AI-ONLY | Vite build configuration, API proxy setup | Dev server runs on 5173, proxies /api to backend |
| `backend/requirements.txt` | AI-ONLY | Python dependencies (FastAPI, numpy, pandas, pytest) | Dependencies for backend/simulation |
| `backend/locustfile.py` | STUDENT CORE | Load testing scenarios for stress testing | Load test patterns, concurrent user simulation |

---

## File Classification Summary

### 🔴 STUDENT CORE (Non-Negotiable - 8 files)

**Backend Algorithm & Logic:**
1. `backend/core/placement.py` — Fair placement matching algorithm
2. `backend/services/simulation.py` — Simulation orchestration
3. `backend/services/real_world_demo.py` — Real BECE validation
4. `backend/data/bece_2024_scenario.py` — Real data integration
5. `backend/tests/test_placement.py` — Algorithm validation
6. `backend/tests/test_real_world_2024_bece.py` — Real-world verification

**Frontend Core Logic:**
7. `frontend/src/pages/ComparisonResults.tsx` — Validation presentation
8. `backend/locustfile.py` — Load testing strategy

**Total:** ~2,200 lines  
**Student accountability:** High ✓

---

### 🟡 AI+ME (Collaborative - 9 files)

**Backend Infrastructure:**
1. `backend/main.py` — API endpoints
2. `backend/models/schemas.py` — Data structures

**Frontend UI:**
3. `frontend/src/api/client.ts` — API client
4. `frontend/src/components/Layout.tsx` — Layout component
5. `frontend/src/pages/Dashboard.tsx` — Dashboard page
6. `frontend/src/pages/Simulation.tsx` — Simulation form
7. `frontend/src/pages/LoadTest.tsx` — Load test interface
8. `frontend/src/pages/Result.tsx` — Results display
9. `frontend/src/pages/Compare.tsx` — Comparison form
10. `frontend/src/App.tsx` & `main.tsx` — App routing

**Total:** ~2,500 lines  
**Student accountability:** Medium 🤝

---

### 🟢 AI-ONLY (Boilerplate/Infrastructure - 6 files)

**Configuration & Styling:**
1. `frontend/src/index.css` — Global styling/theming
2. `frontend/package.json` — NPM configuration
3. `frontend/tsconfig.json` — TypeScript config
4. `frontend/vite.config.ts` — Build config
5. `backend/requirements.txt` — Python dependencies
6. `README.md` — Documentation

**Total:** ~400 lines  
**Student accountability:** Minimal ✅  
**Interrogation Risk:** No ✓

---

## Data Flow & Interactions

### Simulation Flow (Student Core)
```
User Input (Simulation Page - UI)
    ↓ (AI+ME)
API Call (client.ts - AI+ME)
    ↓
POST /simulate (main.py - AI+ME)
    ↓
run_simulation() (simulation.py - STUDENT)
    ↓
place_candidates() (placement.py - STUDENT)
    ↓
Results with metrics (schemas.py - AI+ME)
    ↓
Result Page (Result.tsx - AI+ME)
```

### Comparison Flow (Student Core)
```
User Input (Compare Page - AI+ME)
    ↓
API Call (client.ts - AI+ME)
    ↓
POST /compare (main.py - AI+ME)
    ↓
run_simulation() (simulation.py - STUDENT)
    ↓
GES Baseline Implementation (STUDENT CORE)
    ↓
Comparative Metrics (STUDENT)
    ↓
ComparisonResults.tsx (STUDENT CORE - info design)
```

### Real-World Validation Flow (Student Core)
```
Real BECE 2024 Data (bece_2024_scenario.py - STUDENT)
    ↓
run_real_world_scenario() (real_world_demo.py - STUDENT)
    ↓
place_candidates() (placement.py - STUDENT)
    ↓
Validate vs. GES Baseline (test_real_world_2024_bece.py - STUDENT)
    ↓
Results: Framework ≈ GES (Comparable Performance Validated)
```

---

## Key Technical Metrics

| Metric | Value | Student Core? |
|--------|-------|---------------|
| Backend Lines (Prod) | ~1,450 | 90% |
| Backend Lines (Tests) | ~450 | 100% |
| Frontend Lines (Prod) | ~1,800 | 20% |
| Frontend Lines (Config) | ~200 | 0% |
| Algorithm Complexity | High | ✓ |
| Validation Coverage | Comprehensive | ✓ |
| Real-World Data Integration | 590K+ candidates | ✓ |

---

## Student Interrogation Checklist

**Student MUST be able to explain:**
- ✅ Fair placement algorithm logic and optimization strategy
- ✅ How simulation metrics are calculated
- ✅ What "comparable performance" means (±0.5% placement rate)
- ✅ Real BECE 2024 data integration and validation
- ✅ Equity analysis methodology
- ✅ Information architecture of ComparisonResults page (why verdict is at bottom)
- ✅ How framework validates against GES baseline

**Student CAN describe at high level:**
- ✓ How form pages work (Simulation, Compare, LoadTest)
- ✓ How results are displayed and rendered
- ✓ API communication between frontend and backend
- ✓ What each page shows to users

**Student NEED NOT explain in detail:**
- ✗ CSS variable implementation specifics
- ✗ Vite/TypeScript/FastAPI framework boilerplate
- ✗ Exact HTTP request/response handling code
- ✗ NPM/pip dependency management

---

## Sign-Off

**Code Architecture Status:** ✅ Complete and classified

**Student Core Codebase:** ~2,200 lines (algorithm, simulation, validation, testing)  
**Supporting Infrastructure:** ~2,900 lines (API, UI, configuration)

**Framework Readiness:** Production-ready with comprehensive testing and real-world validation

