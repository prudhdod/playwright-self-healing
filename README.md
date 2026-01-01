# Playwright Self-Healing Framework

> A Playwright + TypeScript test framework with self-healing locator strategies and optional AI-based locator suggestions.

---

## Overview

This repository contains a Playwright test framework that implements resilient locator strategies, fallback rule-based healing, and optional AI-assisted locator suggestions. It is organized with Page Object Model (POM) pages, fixtures, and a modular `src/` implementation for healing, AI adapters, and logging.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ (comes with Node)
- Git
- Optional: Docker (for running local LLMs like Ollama)

## Quick setup

1. Clone the repo

```bash
git clone <your-repo-url>
cd playwright-self-healing
```

2. Copy environment template and set secrets

```bash
cp .env.example .env
# Edit .env with your LLM/API keys and BASE_URL
```

3. Install dependencies

```bash
npm install
```

4. (Optional) Install Playwright browsers

```bash
npx playwright install --with-deps
```

## Available scripts

Scripts available in `package.json`:

- `npm run test` — Run Playwright tests
- `npm run test:headed` — Run tests in headed mode
- `npm run test:debug` — Run tests with Playwright inspector/debugger
- `npm run test:auth` — Run the auth spec file
- `npm run test:dashboard` — Run the dashboard spec file
- `npm run test:single-browser` — Run tests in the Chromium project
- `npm run report` — Open the HTML report (`playwright show-report`)
- `npm run codegen` — Playwright codegen helper
- `npm run ensure-auth` — Run the ensureAuth spec in Chromium
- `npm run lint` — Run TypeScript compiler check (`tsc --noEmit`)

These reflect the `scripts` in the repository's `package.json`.

## Configuration

- Primary configuration lives in `playwright.config.ts` and `.env`.
- Copy `.env.example` to `.env` and fill in the following (at minimum):
  - `BASE_URL` — application base URL
  - `LLM_PROVIDER` — `huggingface` | `ollama` | `anthropic`
  - Provider-specific keys (e.g., `HF_API_TOKEN`, `ANTHROPIC_API_KEY`, or `OLLAMA_BASE_URL`)

Environment example is provided in `.env.example`.

## Project structure (high level)

- `tests/fixtures/` — Playwright fixtures used by tests
- `tests/pages/` — Page objects (POM)
- `tests/specs/` — Test specs
- `src/healing/` — Self-healing engine, DOM analyzer, fallback strategies
- `src/ai/` — LLM adapters and prompt templates
- `src/logging/` — Healing logs and reporting
- `playwright.config.ts` — Playwright runner config

## How self-healing works (summary)

1. Tests use resilient selectors where possible (role/text/label-based).
2. On locator failure, `HealingEngine` runs rule-based fallback strategies.
3. If fallbacks fail and AI is enabled, the framework can call an LLM (Hugging Face, Anthropic/Claude, or local Ollama) to propose alternative selectors.
4. All healing attempts are logged to `src/logging/healingReport.json` (or similar) for review.

## AI / LLM setup (optional)

Choose one provider and set appropriate environment variables in `.env`:

- Hugging Face: set `LLM_PROVIDER=huggingface` and `HF_API_TOKEN`
- Ollama (local): set `LLM_PROVIDER=ollama`, `OLLAMA_BASE_URL`, and `OLLAMA_MODEL`
- Anthropic/Claude: set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY`

Notes:

- Hugging Face is easiest to start with (cloud API key required).
- Ollama runs locally and avoids API limits, but requires local compute.

## Running tests

Run full suite:

```bash
npm run test
```

Run a single spec:

```bash
npm run test:auth
```

Run headed (debug) mode:

```bash
npm run test:headed
```

Open the HTML report after a run:

```bash
npm run report
```

## CI (GitHub Actions)

The repository includes an example GitHub Actions workflow under `.github/workflows/` (if present) that:

- Installs dependencies and Playwright browsers
- Runs tests in matrix (browsers)
- Uploads `playwright-report/` and healing logs as artifacts

Add the following secrets in GitHub repo settings as needed: `HF_API_TOKEN`, `ANTHROPIC_API_KEY`, `BASE_URL`, `LLM_PROVIDER`.

## Troubleshooting

- If `npm install` fails due to peer deps, try `npm install --legacy-peer-deps`.
- If AI calls are rate-limited, switch to Ollama or upgrade provider plan.
- Ensure `src/logging` exists and is writable to store healing logs.

## Contributing

- Follow the repository structure and add tests under `tests/specs/`.
- Keep POM page methods reusable and use `BasePage.safeClick` / `safeFill` to utilize healing features.

## Where to look next

- `src/healing/healingEngine.ts` — healing workflow
- `src/ai/locatorSuggester.ts` — LLM adapter and selector parsing
- `tests/pages/` — page object examples
- `tests/fixtures/fixtures.ts` — how tests are wired with page objects
