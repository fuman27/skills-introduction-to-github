# Repository guidance for agents

This file helps coding agents (and humans) work effectively in this repository.

## What this repo is

- **Primary content**: The GitHub Skills course **“Introduction to GitHub”** — an instructional `README.md` with step-by-step activities (branches, commits, pull requests, merge).
- **Supporting assets**: Images under `images/`, course copy under `.github/steps/`, and GitHub Actions workflows under `.github/workflows/` that drive the learning experience on GitHub.
- **License**: MIT — see `LICENSE`.

## Default branch and collaboration

- **`main`** is the default branch and the stable baseline for the course materials.
- Feature work should use **topic branches** and integrate via **pull requests**, consistent with the course’s own workflow.

## What to change (and what to leave alone)

- **Safe to edit for normal fixes**: `README.md`, `images/`, `.gitignore`, documentation at the root (including this file), and tests or tooling you add explicitly for the project.
- **Course mechanics**: `.github/workflows/` and `.github/steps/` are tied to the Skills course automation. **Do not** rename workflows, change trigger branch names the course relies on, or rewrite step files unless the task explicitly requires it — unintended edits can break learners’ progress.
- **Avoid drive-by churn**: Prefer small, purposeful diffs. Do not reformat or “modernize” the entire README unless that is the request.

## Build, test, and dependencies

- There is **no root application manifest** (no `package.json`, `requirements.txt`, or similar) in the tracked tree. There is nothing to install or build for the stock course repo.
- If you add an app or tooling subdirectory later, document **install, dev, lint, and test** commands here or in that subfolder’s README so agents can run them consistently.

## Conventions

- **Markdown**: Match the style of existing course docs (headings, lists, links to GitHub Docs where appropriate).
- **Images**: Prefer assets under `images/` with clear names; keep file sizes reasonable for the web UI.

## Quick reference

| Path | Role |
|------|------|
| `README.md` | Main course instructions |
| `.github/workflows/` | Course automation (edit only when necessary) |
| `.github/steps/` | Step copy for the course UI |
| `images/` | Screenshots and figures for the README |

When in doubt, preserve the course’s instructional structure and ask for a narrow change rather than a broad rewrite.
