# Climate Migration Intelligence Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Git
- MapBox Account (for map visualizations)

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd climate-migration-platform

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration (Backend Cloud)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# MapBox Configuration (Required for 3D Maps)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Getting MapBox Access Token

1. Create a free account at [mapbox.com](https://www.mapbox.com/)
2. Go to your Account → Access Tokens
3. Create a new token or use the default public token
4. Add the token to your `.env` file as `VITE_MAPBOX_ACCESS_TOKEN`

## 🗄️ Database Schema

The platform uses PostgreSQL (via Supabase) with the following tables:

### Core Tables

| Table                      | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| `districts`                | Maharashtra district data with geo-coordinates, elevation, drought indices |
| `climate_observations`     | Time-series climate data (rainfall, temperature, soil moisture)            |
| `migration_events`         | Migration flows between districts with causes and volumes                  |
| `causal_links`             | Discovered causal relationships with p-values and confidence intervals     |
| `policy_interventions`     | Active and planned policy interventions                                    |
| `counterfactual_scenarios` | What-if analysis comparing baseline vs intervention                        |
| `simulation_runs`          | Policy simulation history and results                                      |
| `causal_certificates`      | Validation certificates for causal models                                  |
| `resilience_scores`        | District-level resilience metrics                                          |

### Database Connection

The platform connects to the configured Supabase instance. No manual database setup is required when using the hosted version.

For local development with a custom Supabase instance:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations from `supabase/migrations/` folder
3. Update your `.env` with the Supabase credentials

## 📊 Data Sources

### Official Climate Data

- **India Meteorological Department (IMD)**: https://mausam.imd.gov.in/
- **India Water Resources Information System**: https://indiawris.gov.in/
- **Maharashtra State Data Bank**: https://mahasdb.maharashtra.gov.in/

### Migration & Census Data

- **Census of India**: https://censusindia.gov.in/
- **National Sample Survey Office (NSSO)**: https://mospi.gov.in/
- **Maharashtra Economic Survey**: https://mahades.maharashtra.gov.in/

### Geospatial Data

- **Survey of India**: https://surveyofindia.gov.in/
- **ISRO Bhuvan**: https://bhuvan.nrsc.gov.in/

## 🔬 Causal Analysis Features

### 1. Correlation vs Causation

- Granger causality tests for time-lagged relationships
- Difference-in-differences analysis for policy impact
- Synthetic control methods for counterfactual estimation

### 2. Delayed & Nonlinear Responses

- Configurable lag periods (7-365 days) for causal chains
- Threshold effects (e.g., drought triggers migration only above 60%)
- Exponential and sigmoid response curves

### 3. Counterfactual Analysis

- Side-by-side scenario comparison
- "Butterfly Effect" toggle for alternative histories
- Policy intervention impact projections

### 4. Confidence Quantification

- P-value thresholds for causal validation
- Confidence intervals on all projections
- 100-iteration placebo tests for robustness

### 5. Evidence for Climate Adaptation

- Causal certificates for validated relationships
- Exportable reports for policymakers
- Long-term adaptation pathway visualization

## 🗺️ MapBox Integration

The platform uses MapBox GL JS for high-fidelity 3D terrain visualization:

### Features

- **3D Terrain**: Elevation-based rendering of Maharashtra
- **Dynamic Markers**: District markers sized by migration volume, colored by drought severity
- **Migration Flows**: Animated flow lines between source and destination districts
- **Interactive Popups**: Hover for detailed district statistics

### Map Modes

- **Current Reality**: Live data from the database
- **Simulated Future**: Projected outcomes based on policy interventions

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Dashboard layout, sidebar
│   ├── ui/              # Shadcn/ui components
│   └── visualizations/  # Maps, charts, DAG
│       ├── MapBoxMaharashtra.tsx  # Main MapBox component
│       ├── DynamicCausalDAG.tsx   # Causal relationship graph
│       └── DynamicAlertTicker.tsx # Live alert system
├── hooks/               # Data fetching hooks
│   ├── useDistricts.ts
│   ├── useMigrationEvents.ts
│   ├── useCausalLinks.ts
│   └── ...
├── pages/               # Route components
└── integrations/        # Supabase client (auto-generated)
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Shadcn/ui, Radix UI
- **Data Fetching**: TanStack Query
- **Maps**: MapBox GL JS
- **Backend**: Supabase
- **Charts**: Recharts, Custom SVG

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## 📜 License

MIT License - See LICENSE file for details.
