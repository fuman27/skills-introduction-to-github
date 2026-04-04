# Agent instructions

This repository is the **GitHub Skills** course *Introduction to GitHub*. It is a **learner-facing template**: GitHub Actions workflows advance the course by updating `README.md` and step metadata when learners complete activities (for example, creating branch `my-first-branch`).

## Repository layout

| Area | Role |
|------|------|
| `README.md` | Course steps; workflows swap step content. Treat edits as part of the course narrative. |
| `.github/workflows/` | Step automation (`0-welcome` through `4-merge-your-pull-request`). Do not rename workflows or change trigger semantics without understanding the full course flow. |
| `.github/steps/` | Step instructions (`*.md`), current step marker (`-step.txt`), and finish content. |
| `.github/dependabot.yml` | Dependency updates for Actions. |

## Guidelines for coding agents

1. **Preserve course mechanics**  
   Avoid changes that break the expected branch names, file paths, or workflow conditions the course relies on (see workflow `if:` blocks and job steps).

2. **Minimize scope**  
   Prefer small, focused changes. Do not refactor unrelated workflows or copy.

3. **Test impact**  
   After editing workflows or step files, consider whether a fork using this template would still advance steps correctly.

4. **Nested or untracked projects**  
   If you add or work inside a subdirectory app (for example, a separate Node or Python project), keep that work self-contained and do not wire it into course workflows unless explicitly requested.

5. **Documentation**  
   Do not add new top-level markdown files unless the task asks for them. This file (`AGENTS.md`) is the exception for agent onboarding.

## Git and branches

- Default branch is typically `main`. Feature work may use a `cursor/...` branch per environment instructions.
- When contributing fixes to the course content itself, use a descriptive branch name and open a pull request as usual.

## Useful references

- [GitHub Actions: Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [About GitHub Skills](https://skills.github.com/) (course context)
