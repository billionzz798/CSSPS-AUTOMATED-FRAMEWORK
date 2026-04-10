# Code Architecture: AI+ME Classification Details

**Project:** CSSPS Automated Testing Framework  
**Classification Focus:** AI+ME Files (Collaborative Student + AI)  
**Total Files:** 10 files  
**Total Lines:** ~2,500 LOC  

---

## Overview: What is AI+ME?

**AI+ME Classification** indicates files where:
- **Structure & Logic**: Defined by student's system understanding and requirements
- **Implementation & Scaffolding**: Generated/assisted with AI for efficiency
- **Student Responsibility**: Understands what the code does, design decisions, data flows
- **Interrogation Level**: Can describe functionality and purpose; doesn't need to know every implementation detail

**Example:** Student says "API client sends HTTP requests to backend endpoints and handles responses" — that's enough. Student doesn't need to memorize axios response interceptor syntax.

---

## Backend AI+ME Files (2 files, ~400 LOC)

### 1. `backend/main.py` — FastAPI Application Setup

**Classification:** AI+ME 🤝

**What It Does:**
Configures the FastAPI web framework to expose the placement framework as an API. Defines all HTTP endpoints that the frontend calls.

**Structure:**
```python
# Conceptual structure (not exact code)
@app.post("/simulate")
async def simulate(config: SimulationConfig):
    # Call placement simulation logic
    return results

@app.post("/compare")
async def compare(config: ComparisonConfig):
    # Run comparison against GES baseline
    return comparison_results

@app.post("/load-test")
async def load_test(config: LoadTestConfig):
    # Execute load testing
    return stress_test_results

@app.get("/metrics")
async def get_metrics():
    # Return framework performance metrics
    return metrics
```

**Key Endpoints:**
| Endpoint | Method | Purpose | Calls |
|----------|--------|---------|-------|
| `/simulate` | POST | Run placement simulation with custom parameters | `simulation.run_simulation()` |
| `/compare` | POST | Compare framework vs. GES baseline | `simulation.run_simulation()` + baseline comparison |
| `/load-test` | POST | Execute stress testing with concurrent requests | Load test orchestration |
| `/health` | GET | System health check | Health status |
| `/metrics` | GET | Framework performance metrics | Metrics collection |

**Data Flow:**
```
Frontend HTTP Request
    ↓
FastAPI Route Handler (main.py - AI+ME)
    ↓
Input Validation (Pydantic schemas - AI+ME)
    ↓
Call Backend Service (simulation.py - STUDENT CORE)
    ↓
Return Response JSON (schemas.py - AI+ME)
    ↓
Frontend HTTP Response Handler
```

**Why AI+ME:**
- **Student Designed:** Decided what endpoints are needed and what they do
- **AI Implemented:** FastAPI boilerplate (decorator syntax, request/response handling, CORS setup)
- **Student Understands:** "POST /simulate calls the simulation service and returns results"
- **Student Doesn't Need:** "How to configure async request handlers in FastAPI"

**Line Count:** ~150 lines  
**Complexity:** Low (endpoint wiring, framework setup)

---

### 2. `backend/models/schemas.py` — Data Structure Definitions

**Classification:** AI+ME 🤝

**What It Does:**
Defines the data structures (schemas) for API communication. Uses Pydantic to validate incoming requests and outgoing responses.

**Key Data Classes:**

**Input Schemas:**
```python
class SimulationConfig:
    num_candidates: int          # e.g., 590309
    num_schools: int             # e.g., 724
    choices_per_candidate: int   # e.g., 6
    random_seed: int = None      # Reproducibility

class ComparisonConfig:
    simulation_config: SimulationConfig
    baseline_type: str           # "ges_2024"
```

**Output Schemas:**
```python
class PlacementResult:
    total_placed: int
    placement_rate: float        # 0.83 = 83%
    first_choice_rate: float     # 0.705 = 70.5%
    unplaced_count: int
    metrics: dict

class EquityMetrics:
    placement_by_region: dict    # {region: rate}
    satisfaction_by_region: dict # {region: first_choice_rate}
    capacity_utilization: dict   # {school: utilization}
```

**Why AI+ME:**
- **Student Designed:** Decided what data fields are needed for each operation
- **AI Implemented:** Pydantic model syntax, validation rules, JSON serialization
- **Student Understands:** "PlacementResult contains placement_rate, first_choice_rate, and unplaced_count"
- **Student Doesn't Need:** "How Pydantic validators work with field decorators"

**Line Count:** ~150 lines  
**Complexity:** Low (data structure definitions)

---

## Frontend AI+ME Files (8 files, ~2,100 LOC)

### 3. `frontend/src/api/client.ts` — API Client/HTTP Communication

**Classification:** AI+ME 🤝

**What It Does:**
TypeScript wrapper around HTTP requests to the backend. Provides type-safe methods for calling each endpoint.

**Key Methods:**
```typescript
// Conceptual structure
export const apiClient = {
  runSimulation: async (config: SimulationConfig) 
    => POST /simulate → PlacementResult
  
  compareFrameworks: async (config: ComparisonConfig) 
    => POST /compare → ComparisonResult
  
  runLoadTest: async (config: LoadTestConfig) 
    => POST /load-test → LoadTestResult
  
  getMetrics: async () 
    => GET /metrics → FrameworkMetrics
}
```

**Data Flow:**
```
React Component calls: apiClient.runSimulation(config)
    ↓
client.ts sends: POST http://localhost:8000/api/simulate
    ↓
Backend receives in: main.py@app.post("/simulate")
    ↓
Backend returns: PlacementResult JSON
    ↓
client.ts returns: typed PlacementResult object
    ↓
React Component receives results
```

**Why AI+ME:**
- **Student Designed:** Decided what methods needed and their signatures
- **AI Implemented:** HTTP request syntax, axios/fetch setup, response handling
- **Student Understands:** "runSimulation sends the config to the backend and returns results"
- **Student Doesn't Need:** "How to configure interceptors or retry logic"

**Line Count:** ~150 lines  
**Complexity:** Low (HTTP wrapper)

---

### 4. `frontend/src/components/Layout.tsx` — Main Layout Component

**Classification:** AI+ME 🤝

**What It Does:**
React component that wraps all pages with consistent layout:
- Navigation header with page links
- Sidebar or top navigation menu
- Content area where pages render
- Footer with info/links
- Responsive design structure

**Structure:**
```tsx
export function Layout({ children }) {
  return (
    <div className="layout">
      <header className="navbar">
        <h1>CSSPS Framework</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/simulation">Simulation</Link>
          <Link to="/load-test">Load Test</Link>
          <Link to="/compare">Compare</Link>
        </nav>
      </header>
      
      <main className="content">
        {children}
      </main>
      
      <footer>Framework v1.0</footer>
    </div>
  )
}
```

**Why AI+ME:**
- **Student Designed:** Decided navigation structure and page organization
- **AI Implemented:** React component boilerplate, layout structure, responsive CSS
- **Student Understands:** "Layout wraps all pages and provides navigation"
- **Student Doesn't Need:** "CSS Grid vs Flexbox implementation details"

**Line Count:** ~200 lines  
**Complexity:** Low (component structure)

---

### 5. `frontend/src/pages/Dashboard.tsx` — Landing/Overview Page

**Classification:** AI+ME 🤝

**What It Does:**
Main landing page showing:
- Framework title and purpose
- Key statistics (590K candidates, 724 schools, 16 regions, 83% baseline)
- Feature cards describing each capability:
  - **Simulation** — Run custom placements
  - **Load Testing** — Stress test with 590K+ concurrent requests
  - **Comparative Analysis** — Compare against GES baseline
  - **Real-World Demo** — Run with actual BECE data
- Links to access each feature

**Purpose:**
Provides entry point and overview. User understands what they can do on first visit.

**Why AI+ME:**
- **Student Designed:** Decided what information to show and how to organize it
- **AI Implemented:** React component structure, card layouts, styling
- **Student Understands:** "Dashboard shows framework overview and links to features"
- **Student Doesn't Need:** "How to implement card hover effects in CSS"

**Line Count:** ~250 lines  
**Complexity:** Low (presentation layer)

---

### 6. `frontend/src/pages/Simulation.tsx` — Simulation Form Page

**Classification:** AI+ME 🤝

**What It Does:**
Provides form interface for running custom placement simulations.

**Form Fields:**
- **Number of Candidates** — integer input (default: 590309 for 2025 BECE)
- **Number of Schools** — integer input (default: 724)
- **Choices per Candidate** — integer input (default: 6-11)
- **Random Seed** — optional integer for reproducibility
- **Run Simulation** button

**On Submit:**
```
1. Validate form inputs
2. Call apiClient.runSimulation(config)
3. Navigate to Result page to display results
```

**Why AI+ME:**
- **Student Designed:** Decided what parameters users can configure
- **AI Implemented:** Form component, input handling, validation, navigation
- **Student Understands:** "Form collects simulation parameters and calls the backend"
- **Student Doesn't Need:** "How to set up form state with useState hooks"

**Line Count:** ~300 lines  
**Complexity:** Medium (form handling, API integration)

---

### 7. `frontend/src/pages/LoadTest.tsx` — Load Testing Interface

**Classification:** AI+ME 🤝

**What It Does:**
Interface for executing load and stress testing.

**Components:**
- **System Health Checks** — Display portal readiness
- **Load Test Configuration** — Set concurrent users, duration
- **Real-Time Metrics Display** — Show ongoing test results
- **Results Summary** — Peak throughput, failure rate, average response time

**Purpose:**
Validates that framework can handle 590K+ concurrent placement requests without failure.

**On Execute:**
```
1. Collect load test parameters
2. Call apiClient.runLoadTest(config)
3. Stream real-time results
4. Display final metrics
```

**Why AI+ME:**
- **Student Designed:** Decided what metrics to display and thresholds
- **AI Implemented:** Real-time updates, metrics display, chart rendering
- **Student Understands:** "LoadTest executes stress testing and shows results"
- **Student Doesn't Need:** "How to implement real-time data streaming with WebSockets"

**Line Count:** ~280 lines  
**Complexity:** Medium (real-time metrics, data visualization)

---

### 8. `frontend/src/pages/Result.tsx` — Simulation Results Display

**Classification:** AI+ME 🤝

**What It Does:**
Displays results from a placement simulation.

**Sections:**
- **Summary** — Total placed, placement rate, first-choice rate
- **Metrics Table** — Detailed statistics
  - Placement rate: 83%
  - First-choice rate: 70.5%
  - Unplaced count: 107,509
  - Average score: 45.2
- **Regional Breakdown** — Placement rate by region
- **Action Buttons** — Download results, Run another simulation

**Data Source:**
Results from `apiClient.runSimulation()` call from Simulation page.

**Why AI+ME:**
- **Student Designed:** Decided what results to show and how to organize them
- **AI Implemented:** Data rendering, table layout, styling
- **Student Understands:** "Result page displays placement simulation outcomes"
- **Student Doesn't Need:** "How to implement responsive table layouts"

**Line Count:** ~350 lines  
**Complexity:** Medium (data rendering, tables)

---

### 9. `frontend/src/pages/Compare.tsx` — Comparison Setup Page

**Classification:** AI+ME 🤝

**What It Does:**
Form interface for configuring comparative analysis between framework and GES baseline.

**Form Sections:**
- **Framework Configuration**
  - Candidates, schools, choices
  - Algorithm version/settings
- **Baseline Selection**
  - GES 2024 baseline (80.93% rate, 70.5% first-choice)
  - Custom baseline option
- **Comparison Type**
  - Side-by-side metrics
  - Equity analysis
  - Fairness metrics

**On Submit:**
```
1. Validate configuration
2. Call apiClient.compareFrameworks(config)
3. Navigate to ComparisonResults page
```

**Why AI+ME:**
- **Student Designed:** Decided what can be configured for comparison
- **AI Implemented:** Form structure, options selection, validation
- **Student Understands:** "Compare page sets up comparison parameters and calls backend"
- **Student Doesn't Need:** "How to implement conditional form fields"

**Line Count:** ~250 lines  
**Complexity:** Medium (form handling, conditional rendering)

---

### 10. `frontend/src/pages/ComparisonResults.tsx` — Comparison Analysis Page

**Classification:** AI+ME with STUDENT CORE elements 🤝➜🔴

**What It Does:**
Displays detailed comparison between framework and GES baseline.

**Sections (in order):**
1. **Header** — Title "Framework vs. GES Baseline Comparison"
2. **Test Parameters** — What was tested (candidates, schools, choices)
3. **Placement Performance** — Side-by-side metrics
   - Framework: 83.1% placement rate
   - GES Baseline: 83.0% placement rate
   - Difference: +0.1% (comparable ✓)
4. **Satisfaction Metrics** — First-choice placement rates
5. **Equity Analysis** — Regional distribution fairness
6. **Summary** — Overall assessment
7. **Verdict** — Conclusion (framework comparable to baseline)
8. **Action Button** — "Run another comparison"

**Information Architecture Decision (STUDENT CORE):**
- Verdict moved from top to bottom
- Rationale: Show data/analysis first, conclusion last
- User understands supporting evidence before reading verdict

**Why AI+ME with Student Core:**
- **AI+ME:** Rendering results tables, styling, layout
- **STUDENT CORE:** Decided what to compare, information flow, verdict criteria (±0.5% = comparable)

**Line Count:** ~400 lines  
**Complexity:** High (comparison logic, data visualization, information design)

---

### 11. `frontend/src/App.tsx` & `frontend/src/main.tsx` — App Entry Point

**Classification:** AI+ME 🤝

**What They Do:**

**main.tsx:** React app initialization
```tsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
```

**App.tsx:** Route configuration
```tsx
export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/load-test" element={<LoadTest />} />
          <Route path="/result" element={<Result />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/comparison-results" element={<ComparisonResults />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
```

**Why AI+ME:**
- **Student Designed:** Decided what pages exist and routing structure
- **AI Implemented:** React Router setup, component mounting
- **Student Understands:** "App.tsx defines navigation between pages"
- **Student Doesn't Need:** "How React Router handles dynamic route matching"

**Line Count:** ~100 lines  
**Complexity:** Low (routing setup)

---

## Styling: Configuration & Infrastructure

### `frontend/src/index.css` — Global Styling

**Classification:** AI-ONLY ✅ (Pure Styling, Not AI+ME)

**What It Does:**
Global CSS with theme variables.

**Theme Variables:**
```css
:root {
  --bg: #f8fafc;              /* Light blue-gray background */
  --surface: #ffffff;          /* White cards */
  --text: #0f1419;            /* Dark text */
  --text-muted: #64748b;      /* Gray muted text */
  --primary: #006A3D;         /* Ghana green */
  --accent: #D21034;          /* Ghana red */
  --highlight: #FFD100;       /* Ghana gold */
}
```

**Why AI-ONLY (Not AI+ME):**
Pure styling with no logic. No decisions to make. Student knows: "We use CSS variables for theming."

---

## AI+ME File Dependencies & Data Flow

```
User Browser
    ↓
App.tsx (AI+ME)
    ├─ Routes to pages
    ├─ Layout.tsx (AI+ME) wraps pages
    │
    ├─→ Dashboard.tsx (AI+ME)
    │    └─ Links to other pages
    │
    ├─→ Simulation.tsx (AI+ME)
    │    ├─ Collects parameters
    │    └─ Calls apiClient.runSimulation() (AI+ME)
    │        ↓
    │        POST /simulate (main.py - AI+ME)
    │        ↓
    │        placement.py (STUDENT CORE) ← Calls
    │        ↓
    │        Returns PlacementResult (schemas.py - AI+ME)
    │        ↓
    │    Result.tsx (AI+ME) displays results
    │
    ├─→ LoadTest.tsx (AI+ME)
    │    └─ Calls apiClient.runLoadTest() (AI+ME)
    │        ↓
    │        POST /load-test (main.py - AI+ME)
    │        └─ Load testing (STUDENT CORE)
    │
    └─→ Compare.tsx (AI+ME)
         └─ Calls apiClient.compareFrameworks() (AI+ME)
             ↓
             POST /compare (main.py - AI+ME)
             ↓
             simulation.py (STUDENT CORE) + GES Baseline
             ↓
             ComparisonResults.tsx (AI+ME + STUDENT CORE)
```

---

## Student Interview Questions (AI+ME Files)

**What Students Should Explain:**

1. **What does main.py do?**
   - ✅ "It defines API endpoints that the frontend calls"
   - ❌ "It uses async/await for concurrent request handling"

2. **Why do we have schemas.py?**
   - ✅ "It defines data structures for API input/output and validates them"
   - ❌ "Pydantic uses metaclasses to create validators"

3. **How does the Simulation page work?**
   - ✅ "User enters parameters, clicks Run, it calls the backend to simulate placement and shows results"
   - ❌ "It uses useFormData hook with onChange event handlers"

4. **What's the purpose of ComparisonResults page?**
   - ✅ "It shows the framework and GES baseline side-by-side, including performance metrics, equity analysis, and a verdict"
   - ✅ "The verdict is at the bottom so users see the data first before reading the conclusion"
   - ❌ "It renders a flex container with grid layout for the table sections"

5. **How is the API client used?**
   - ✅ "It provides type-safe methods to call backend endpoints and returns results"
   - ❌ "It sets up axios interceptors for request/response transformation"

---

## Summary: AI+ME Files at a Glance

| File | Purpose | Student Understands | AI Implements |
|------|---------|-------------------|-----------------|
| main.py | API endpoints | What endpoints do | Framework wiring |
| schemas.py | Data validation | What fields needed | Pydantic syntax |
| api/client.ts | HTTP communication | Method signatures | Request handling |
| components/Layout.tsx | Page wrapper | Navigation structure | CSS layout |
| pages/Dashboard.tsx | Landing page | What info to show | Component layout |
| pages/Simulation.tsx | Simulation form | What parameters | Form state |
| pages/LoadTest.tsx | Load test interface | What metrics | Chart rendering |
| pages/Result.tsx | Results display | What results matter | Table rendering |
| pages/Compare.tsx | Comparison form | What to configure | Form logic |
| pages/ComparisonResults.tsx | Comparison display | Information order | Styling |
| App.tsx | App routing | Page structure | Router setup |

**Total AI+ME:** 11 files, ~2,500 LOC  
**Student Accountability:** Medium 🤝

---

## Bottom Line

**AI+ME files are the glue that connects:**
- Frontend UI (what users interact with)
- Backend services (where computation happens)

**Student responsibility:** Understand the flow and why each piece exists.  
**No need to memorize:** Specific JavaScript/Python framework syntax.

