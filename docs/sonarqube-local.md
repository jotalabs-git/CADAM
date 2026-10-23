# SonarQube local analysis

This fork follows the local scanner pattern used in SkyCars: `@sonar/scan`, `pnpm sonar`, and a repository-root `sonar-project.properties`.

## Prerequisites

- A running SonarQube instance reachable from your development machine
- A project with key `jotalabs-cadam` (or permission for automatic project provisioning)
- A SonarQube token with permission to analyze that project
- Node.js and pnpm as specified in `package.json`

## Analyze

```bash
pnpm install
export SONAR_HOST_URL="http://localhost:9000"
export SONAR_TOKEN="<your-sonarqube-token>"
pnpm sonar
```

Change the URL if your server uses another port or hostname. Keep secrets out of Git and shell history where feasible. You can use environment management or an untracked private environment file, then source it locally.

The analysis covers `src/` and `shared/`, excludes vendored/generated/build artifacts, and identifies existing tests. No LCOV path is configured because this repository does not yet provide a verified coverage generation script. SonarQube analysis does not execute tests.

The GitHub Actions workflow intentionally does not connect to a local network SonarQube instance. Run this command on your development machine or a self-hosted runner that can reach your server.

If the SonarQube project already exists under a different key, change `sonar.projectKey` in `sonar-project.properties` to match it.

## Strict quality rules for new code

This fork adopts these rules for **new code only**:

- 0 new issues
- A rating for new security, reliability, and maintainability code
- At least 80% test coverage on new code
- No more than 1% duplicated lines on new code; engineering goal: 0%

First, generate coverage and run the scanner:

```bash
pnpm install
pnpm test:coverage
pnpm sonar
```

The test suite currently uses Node's built-in `node:test` API, executed with `tsx`. The `c8` collector writes `coverage/lcov.info` for SonarQube. CI verifies that the report exists; the actual 80% threshold applies to **new code** in SonarQube, not to the legacy repository as a whole.

An administrator can provision the project-specific gate **on the machine that can reach the SonarQube instance**:

```bash
export SONAR_HOST_URL="http://localhost:9000"
export SONAR_TOKEN="<admin-token>"
bash scripts/configure-sonar-quality-gate.sh
```

The script creates `CADAM - Strict New Code` and assigns it to project `jotalabs-cadam`. It does not override an existing gate with conditions, to avoid destructive modifications. Set the New Code definition in the project's SonarQube settings (for example, a reference branch or version baseline); this choice is server-side and is not embedded in the scanner properties. On a first run, check that SonarQube actually measures some new lines before treating a green gate as evidence of compliance.

Do not commit tokens. A local SonarQube service is not reachable from standard GitHub-hosted runners, so gate checking remains a local or self-hosted runner operation.
