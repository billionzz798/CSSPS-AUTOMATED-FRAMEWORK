# Running the CSSPS Automated Testing Framework

## Quick Start

The framework consists of two parts that must both be running:

### 1. Start the Backend (Required)

In one terminal window, run:

```bash
./start-backend.sh
```

Or manually:

```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend will start on `http://0.0.0.0:8000`

### 2. Start the Frontend (Required)

In another terminal window, run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Why Features Weren't Working

The simulation and comparison features require the backend server to be running. The frontend makes API calls to:
- `POST /api/simulate` - Start a simulation job
- `GET /api/simulate/{job_id}` - Poll for simulation results
- `POST /api/compare` - Start a comparison job  
- `GET /api/compare/{job_id}` - Poll for comparison results

If the backend is not running, these requests will fail silently or show network errors.

## Health Check

To verify the backend is running:

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "ok",
  "service": "cssps-framework"
}
```

## Architecture

- **Backend**: FastAPI (Python) on port 8000
  - Generates synthetic BECE candidate and school data
  - Runs fair placement algorithm
  - Compares against GES baseline
  - Stores job results in memory (in-memory store for demo)

- **Frontend**: React + TypeScript + Vite on port 5173
  - Provides UI for running simulations
  - Shows placement results
  - Displays fairness metrics
  - Compares framework performance

The frontend proxies `/api` and `/health` requests to the backend (see `frontend/vite.config.ts`)

## Features That Are Working

- ✅ **Simulation** - Run fair placement with custom candidate/school counts
- ✅ **Comparison** - Compare automated framework vs GES baseline
- ✅ **Load Test** - System resilience checks
- ✅ **Dashboard** - View framework overview and health status
- ✅ **Results** - Display detailed placement results and metrics

## Troubleshooting

**Frontend says "API Unavailable"**
- Check that backend is running: `curl http://localhost:8000/health`
- Verify backend is on port 8000 (not a different port)
- Check browser console for network errors

**Backend crashes or errors**
- Check Python version: `python3 --version` (needs 3.10+)
- Check dependencies: `pip3 install -r requirements.txt`
- Check for port conflicts: `lsof -i :8000`

**Simulation takes too long**
- Large simulations (100,000+ candidates) may take several minutes
- Start with smaller numbers (10,000 candidates) for testing

## Environment Variables

None required - the system uses sensible defaults.

Optional configuration could include:
- Backend host/port via environment variables
- Frontend API base URL
- Job storage backend (Redis, database, etc.)

## Performance Benchmarks

Typical performance on modern hardware:
- 10,000 candidates, 200 schools: ~1-2 seconds
- 100,000 candidates, 200 schools: ~10-15 seconds  
- 553,155 candidates (2024 BECE), 200 schools: ~60-90 seconds

See [BECE_YEAR_STATISTICS_FOR_TESTING.md](BECE_YEAR_STATISTICS_FOR_TESTING.md) for real BECE data specifications.
