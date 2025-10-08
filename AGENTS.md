# Repository Guidelines

## Project Structure & Key Files
The heart of this repository is the automation script `instalador.sh` located at the project root. Every contribution should start by understanding its sequential flow: environment setup, dependency installation, service configuration, and cleanup. The script streams progress and diagnostics into `scripts/chatia-install.log`; treat that log as the canonical record of any installation run. When exercising new logic, always confirm that the log captures start and end markers, command output, and error traces so operators can replay the narrative after the fact.

## Build & Validation Workflow
Before pushing changes, run `bash -n instalador.sh` to catch syntax errors and `shellcheck instalador.sh` to flag quoting, heredoc, or command-substitution issues. Execute `sudo ./instalador.sh` inside a disposable VM or container, redirecting output with `sudo ./instalador.sh | tee scripts/chatia-install.log` if you need real-time visibility. After each run, archive a copy of `scripts/chatia-install.log` alongside your test notes; this log must exist and be readable even when the script exits early.

## Coding Style & Naming Conventions
Maintain two-space indentation inside functions and align closing braces flush left. Name functions and locals in lower_snake_case; reserved environment variables, constants, and heredoc delimiters remain UPPER_SNAKE_CASE. Prefer the shared logging helpers (`log_info`, `log_error`, etc.) so that `scripts/chatia-install.log` stays uniform. For heredocs executed through nested shells (e.g., `sudo -u deploy bash -lc`), always use the single-quoted form `<<'DELIM'` to prevent double expansion and garbled output in the log.

## Working with scripts/chatia-install.log
Never commit the log file, but do rely on it for validation. Ensure each major block in `instalador.sh` emits a clear header, success message, and error branch so troubleshooting is linear. When introducing new steps, add context-rich messages (command being run, target host, expected result) and append actionable remediation hints when failures occur. If you rotate or truncate the log in your workflow, document the convention in your PR so operators replicate it reliably.

## Commit & Pull Request Guidelines
Follow the existing history pattern of `checkpoint - <percent>` for iterative work; only use `checkpoint - 100%` when the installer and accompanying log output prove production ready. Every PR should outline what changed in `instalador.sh`, summarise validation commands, and attach or reference the relevant excerpt of `scripts/chatia-install.log` that demonstrates success and failure handling.
