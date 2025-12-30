# Material Request Tracker (Senior Candidate Submission)

A high-performance, multi-tenant material procurement system designed for modern construction sites. Built with a focus on speed, reliability, and AI-driven efficiency.

## ✨ The "AI Twist"
This application features **Smart Suite Intelligence**, a suite of simulated smart features:
- **Computer Vision Auto-fill**: On the request form, users can upload a site photo to automatically detect and populate material names, quantities, and priorities (Simulated ROI).
- **Smart Insights Dashboard**: A dedicated AI-analysis section on the dashboard providing logistics tips and risk alerts based on project data.
- **Auto-tagging**: Requests generated via AI are marked with a "Sparkle" icon and metadata in the request list.

## 🏗️ Technical Architecture
- **Framework**: React 18 (Vite) + TypeScript
- **Multi-tenancy**: Isolated data using **PostgreSQL Row Level Security (RLS)**. Users can switch between workspaces they own or the public Demo.
- **State Management**: **TanStack Query v5** for server state with optimized caching (`staleTime`, `gcTime`) and **Optimistic Updates** for status changes.
- **Real-time**: Bi-directional sync with Supabase Realtime for instant project-wide updates.
- **UI/UX**: **Shadcn UI** components customized with a premium dark-mode aesthetic, glassmorphism, and responsive layouts.
- **Compliance**: Uses the exact schema nomenclature requested (`requested_by`, `requested_at`, `project_id`).

## 🚀 Quick Start (Local Setup)

### 1. Database Initialization
Run the content of `supabase/FULL_SETUP.sql` in your Supabase SQL Editor. This script:
- Recreates the schema (Tables: `companies`, `profiles`, `material_requests`).
- Configures all required RLS Policies.
- Optimizes performance with targeted B-tree Indexes.
- Seeds the **Demo Site Alpha** workspace and mock data.

### 2. Environment Configuration
Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
npm run dev
```

## 🛠️ Assignment Requirements Checklist
- [x] **Supabase Setup**: Real-time DB, Auth, and multi-tenant RLS.
- [x] **List Page**: Filtering by status, search, and "Requested By" visibility.
- [x] **Create/Edit Form**: Validated with **React Hook Form + Zod**.
- [x] **Status Workflow**: Confirmation dialogs + Optimistic UI updates.
- [x] **Professional UI**: Loading skeletons, error handling, and premium design.
- [x] **Bonus**: Full CSV Export functionality.
- [x] **Bonus**: AI Twist integration.

---
**Contact**: [karriere@bauai.eu](mailto:karriere@bauai.eu) | **Candidate**: Acer (Submission ID: B-SET-2025)
