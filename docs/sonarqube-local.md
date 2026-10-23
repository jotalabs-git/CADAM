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
