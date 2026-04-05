# AGENTS.md

## Overview

This repository contains:
1. A **GitHub Skills tutorial** ("Introduction to GitHub") at the root — workflow YAML, markdown steps, and repo config.
2. A **Resume Tailor** web application in `resume-tailor/` — a Next.js app that customizes resumes for job applications.

## Cursor Cloud specific instructions

### Resume Tailor App (`resume-tailor/`)

The main application. A Next.js 16 + TypeScript + Tailwind CSS app.

**Commands** (all from `resume-tailor/` directory):
- **Dev server**: `npm run dev` (runs on port 3000)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- **Install deps**: `npm install`

**Architecture**: Next.js app with client-side UI and server-side API routes:
1. Enter resume details (contact, summary, experience, education, skills)
2. Paste job description OR search job boards → instant analysis (match score, skill gaps)
3. View tailored resume (reordered skills/experience, customized summary)

Data persists in localStorage. No external database required.

**Job search providers** (configured via environment variables, see `.env.example`):
- **Adzuna** (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`): Global job search, free 250 req/month
- **USAJobs** (`USAJOBS_API_KEY`, `USAJOBS_EMAIL`): US government jobs, free unlimited
- **JSearch** (`RAPIDAPI_KEY`): Aggregated search via RapidAPI, free 200 req/month

The app works without API keys (paste-only mode). When keys are set, the "Search Job Boards" tab becomes active with provider selection.

### GitHub Actions Workflows (root)

- **`actionlint`** validates workflow syntax. Run `actionlint` from the repo root (exit code 0 = pass).
- **`yamllint`** for general YAML linting. The upstream template has known cosmetic warnings (line length, truthy values).
