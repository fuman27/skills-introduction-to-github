# AGENTS.md

## Overview

This repository is a **GitHub Skills tutorial** ("Introduction to GitHub"). It is **not** a traditional application — there is no source code, no package manager, no build system, and no services to run locally.

The repo contains:
- GitHub Actions workflow YAML files (`.github/workflows/`) that automate tutorial step progression
- Markdown step instructions (`.github/steps/`)
- A `README.md` that is auto-updated by the workflows per tutorial step
- Standard repo config (`.gitignore`, `LICENSE`, `.github/dependabot.yml`)

## Cursor Cloud specific instructions

### Linting

- **`actionlint`** (pre-installed at `/usr/local/bin/actionlint`): validates GitHub Actions workflow syntax and semantics. Run from the repo root:
  ```
  actionlint
  ```
  Exit code 0 with no output means all workflows are valid.

- **`yamllint`** (installed via pip at `~/.local/bin/yamllint`): general YAML linting. Run with:
  ```
  yamllint .github/workflows/ .github/dependabot.yml
  ```
  The upstream template has known cosmetic warnings (line length, truthy values, missing `---`). These are style issues, not structural errors.

### Testing

There are no automated tests in this repository. Validation consists of linting the workflow YAML files with `actionlint` and `yamllint`.

### Building / Running

There is no build step or runnable application. The "application" is the set of GitHub Actions workflows that run on GitHub.com when learners interact with the tutorial (create branches, commit files, open PRs, merge PRs).

### Key files

| File | Purpose |
|---|---|
| `.github/steps/-step.txt` | Tracks the current tutorial step number |
| `.github/workflows/0-welcome.yml` | Step 0→1: triggers on push to main |
| `.github/workflows/1-create-a-branch.yml` | Step 1→2: triggers on branch creation |
| `.github/workflows/2-commit-a-file.yml` | Step 2→3: triggers on push to `my-first-branch` |
| `.github/workflows/3-open-a-pull-request.yml` | Step 3→4: triggers on PR to main |
| `.github/workflows/4-merge-your-pull-request.yml` | Step 4→finish: triggers on PR merge |
