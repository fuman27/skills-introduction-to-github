# Agent instructions

This repository is the **Introduction to GitHub** GitHub Skills course template. It teaches branching, commits, pull requests, and merges using GitHub Actions workflows and step files under `.github/`.

## Scope and constraints

- Prefer **small, focused changes** that match the existing course structure unless the task explicitly asks to refactor or replace it.
- **Do not** rename or remove workflow files under `.github/workflows/` or step content under `.github/steps/` unless the issue or request requires it; course automation depends on predictable paths and step order.
- **README.md** and **LICENSE** are part of the published course; edit them only when updating the course content or fixing clear errors.

## Conventions

- **Default branch:** `main`. Feature work typically uses topic branches and pull requests.
- **Automation:** Workflows in `.github/workflows/` coordinate the skill steps; read them before changing related behavior.
- **Course steps:** Instructional copy lives in `.github/steps/*.md` and is referenced by the workflows.

## Local and untracked content

- Paths like `resume-tailor/` or other local experiments may exist but are **not** part of the core course unless tracked and documented. Treat them as out-of-scope unless the task says otherwise.

## Testing and verification

- There is no application test suite in the template. After edits, sanity-check YAML in `.github/workflows/` and markdown links in touched files. Rely on GitHub Actions when validating workflow behavior.
