# Material Tracker

An enterprise-grade material procurement and tracking system for modern construction management. This platform facilitates real-time coordination between field operations and procurement teams.

## Repository Structure

To maintain clean separation of concerns and scalability, this repository is organized as a service-oriented monorepo:

- `apps/web`: The core React application, built with TypeScript, Vite, and Tailwind CSS.
- `infrastructure/supabase`: Database schema migrations and Row Level Security (RLS) configurations.

## Features

- **Multi-tenant Workspaces**: Secure data isolation using PostgreSQL RLS.
- **Priority Monitoring**: Real-time dashboard with "Live Feed" status for urgent site requirements.
- **Workflow Automation**: Full lifecycle management of material requests.
- **AI-Assisted Entry**: Integrated computer vision (simulated) for rapid material entry.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **State & Sync**: TanStack Query v5, Supabase Realtime
- **Database**: Supabase (PostgreSQL)

## Setup and Development

### 1. Database Initialization
Apply the migration scripts in `infrastructure/supabase/migrations` to your Supabase project in numerical order.

### 2. Application Setup
Navigate to the web application directory:
```bash
cd apps/web
```

Create a `.env` file in `apps/web/`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Running Locally
```bash
npm install
npm run dev
```

---
*Note: All development commands should be executed from within the `apps/web` directory.*
