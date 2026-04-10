# CSSPS Automated Testing Framework 🇬🇭

A comprehensive testing and simulation framework for Ghana's Computer Supervised Computerized Placement System (CSSPS). This framework evaluates the fairness and performance of automated placement algorithms against the current GES (Ghana Education Service) baseline system.

## Features ✨

- **Fair Placement Algorithm**: Automated framework for equitable candidate placement
- **Framework Comparison**: Side-by-side comparison with GES baseline system
- **Comprehensive Metrics**: Analyze placement rates, fairness, equity across regions and demographics
- **Load Testing**: Stress test system resilience with up to 585,000 candidates
- **Beautiful Ghana-Themed UI**: Vibrant, professional interface inspired by Ghana's colors
- **Real-World Scenarios**: Test with actual BECE (Basic Education Certificate Examination) parameters
- **Interactive Dashboard**: Monitor system health and simulation progress in real-time

## Project Structure 📁

```
CSSPS-AUTOMATED-FRAMEWORK/
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # FastAPI application entry point
│   ├── requirements.txt               # Python dependencies
│   ├── core/
│   │   ├── baseline_ges.py           # GES baseline placement algorithm
│   │   └── placement.py              # Automated placement algorithm
│   ├── data/
│   │   ├── bece_2024_scenario.py     # 2024 BECE scenario data
│   │   └── bece_scenarios.py         # Scenario management
│   ├── models/
│   │   └── schemas.py                # Pydantic models for API contracts
│   ├── services/
│   │   ├── comparison.py             # Framework comparison logic
│   │   ├── simulation.py             # Simulation engine
│   │   └── real_world_demo.py        # Real-world demo scenarios
│   └── tests/
│       ├── test_placement.py         # Placement algorithm tests
│       └── test_real_world_2024_bece.py  # Real-world scenario tests
│
├── frontend/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── index.css                 # Global styles with Ghana theme
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.tsx                   # Main application component
│   │   ├── api/
│   │   │   └── client.ts             # API client for backend communication
│   │   ├── components/
│   │   │   └── Layout.tsx            # Header and navigation layout
│   │   └── pages/
│   │       ├── Dashboard.tsx         # Main dashboard
│   │       ├── Simulation.tsx        # Simulation runner
│   │       ├── Compare.tsx           # Framework comparison setup
│   │       ├── ComparisonResults.tsx # Comparison results display
│   │       ├── Result.tsx            # Simulation results
│   │       └── LoadTest.tsx          # Load testing page
│   ├── package.json                  # Node dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   └── vite.config.ts                # Vite build configuration
│
└── README.md                         # This file
```

## Technology Stack 🛠️

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation with Python type hints
- **Python 3.10+** - Primary language

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **CSS-in-JS** - Inline styling with professional design system

### Design
- **Ghana-themed Color Palette**: Red (#D21034), Gold (#FFD100), Green (#006A3D)
- **Kente-Inspired Patterns**: Traditional Ghanaian textile patterns
- **Professional Typography**: Modern, accessible, and readable

## Installation 🚀

### Prerequisites
- Python 3.10 or higher
- Node.js 16 or higher
- Git

### Backend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/billionzz798/CSSPS-AUTOMATED-FRAMEWORK.git
cd CSSPS-AUTOMATED-FRAMEWORK
```

2. **Install Python dependencies:**
```bash
cd backend
pip3 install -r requirements.txt
```

3. **Start the backend server:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **In a new terminal, navigate to frontend:**
```bash
cd frontend
```

2. **Install Node dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running Simulations 🧪

### Quick Start

1. **Access the Dashboard**: Open http://localhost:5173 in your browser
2. **Check System Health**: Dashboard shows API and placement engine status
3. **Run a Simulation**: 
   - Go to "Run Simulation" page
   - Set number of candidates, schools, and choices per candidate
   - Click "Run simulation" and wait for results
4. **View Results**: See placement metrics, fairness analysis, and sample results
5. **Compare Frameworks**: 
   - Go to "Compare Frameworks" page
   - Set test parameters
   - Compare automated framework vs. GES baseline
6. **Load Testing**: 
   - Go to "Load & Resilience" page
   - Check system health
   - Run 585K candidate stress test

### Key Features

#### Simulation Parameters
- **Candidates**: 100 to 1,000,000 (default: 10,000)
- **Schools**: 1 to 5,000 (Ghana has 721 public SHS/TVET schools)
- **Choices per candidate**: 1 to 11 (realistic: 5-6)
- **Random seed**: Optional, for reproducibility

#### Metrics Analyzed
- **Placement Success Rate**: % of candidates placed in chosen schools
- **First-Choice Satisfaction**: % receiving their 1st choice school
- **Equity Performance**: Fairness across regions and gender groups
- **System Efficiency**: Processing time and resource utilization
- **Comparative Verdict**: Which framework performs better

## API Endpoints 📡

### Health & Status
- `GET /health` - API health check
- `GET /api/resilience/check` - Placement engine status

### Simulations
- `POST /api/simulation/start` - Start a new simulation
- `GET /api/simulation/{job_id}` - Get simulation results
- `GET /api/simulation/{job_id}/poll` - Poll for updates

### Comparisons
- `POST /api/comparison/start` - Start framework comparison
- `GET /api/comparison/{job_id}` - Get comparison results

## Project Goals 🎯

1. **Evaluate Fairness**: Test automated placement system's fairness vs. current baseline
2. **Analyze Equity**: Examine placement equity across regions, gender, and demographics
3. **Verify Performance**: Ensure system handles real-world scale (600K+ candidates)
4. **Document Results**: Provide detailed metrics and visualizations for stakeholders
5. **Improve Placement**: Identify improvements to Ghana's student placement process

## Ghana Education Context 🇬🇭

This framework is specifically designed for Ghana's education system:
- **BECE**: Basic Education Certificate Examination (national entrance exam)
- **CSSPS**: Computer Supervised Computerized Placement System
- **Target**: ~600,000 candidates placed annually into secondary schools
- **Goal**: Fair, efficient, and transparent placement

## Performance Benchmarks ⚡

- **Small simulation** (10,000 candidates): ~5 seconds
- **Medium simulation** (100,000 candidates): ~30 seconds
- **Large simulation** (585,000 candidates): ~1-2 minutes
- **Comparison run**: ~3-5 minutes combined

## Contributing 🤝

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License 📄

This project is part of the Ghana Education Service's CSSPS initiative.

## Support 💬

For questions or issues, please contact the development team or open an issue on GitHub.

---

**Created with ❤️ for Ghana's Education System** 🇬🇭

Last Updated: April 10, 2026
