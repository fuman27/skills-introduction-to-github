# Agent instructions

This repository is the **Introduction to GitHub** Skills course template. It teaches branching, commits, pull requests, and merges using GitHub Actions workflows and step content under `.github/`.

## Scope and intent

- **Primary content**: Course copy in `README.md`, images in `images/`, and guided steps in `.github/steps/`.
- **Automation**: Workflows in `.github/workflows/` drive the course progression; they are tied to specific branch names and activities described in the course.
- **Untracked local artifacts**: `resume-tailor/` may appear as a local experiment (e.g. Next.js-related files). It is not part of the published course unless intentionally integrated—treat it as optional and avoid mixing it into course steps without an explicit request.

## What to preserve

- Do not rename course-required branches (e.g. `my-first-branch`) or step filenames that workflows reference unless you update **all** workflow and documentation references together.
- Keep `LICENSE`, contributor-facing links in `README.md`, and the general structure of the Skills course unless the task explicitly changes the course design.

## Editing guidelines

- Prefer small, focused changes that match the instructional tone already in `README.md` and `.github/steps/*.md`.
- When adding or changing images, keep paths consistent with how they are referenced in markdown.
- Match existing YAML style in `.github/workflows/` and `.github/dependabot.yml`.

## Quality checks

- There is no application test suite for the core course repo. After substantive edits to workflows, validate YAML syntax and workflow `on:` / job names against GitHub Actions expectations.
- If you touch markdown, ensure links and image paths resolve relative to the repository root.

## Git and collaboration

- Default branch is typically `main`. Feature work usually uses short-lived branches and pull requests, consistent with the course narrative.
- Do not commit secrets, tokens, or personal data. Use placeholders in examples.

## When in doubt

- Favor clarity for learners over internal tooling detail.
- If a change could break a course step or Action, grep for references to the old name or path and update them in one pass.
