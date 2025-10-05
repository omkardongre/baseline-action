# Baseline GitHub Action

Automatically check web feature compatibility in your CI/CD pipeline.

## Features

- 🔍 **Automated Scanning** - Scans all code changes in PRs
- 📊 **SARIF Support** - Integrates with GitHub Code Scanning
- 💬 **PR Comments** - Posts detailed reports on pull requests
- ⚙️ **Configurable** - Customize baseline year and policies
- 🚨 **Fail on Error** - Optional workflow failure for violations

## Usage

### Basic Setup

Create `.github/workflows/baseline.yml`:

```yaml
name: Baseline Compatibility Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Baseline Check
        uses: omkardongre/baseline-developer-suite/packages/github-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          baseline-year: '2023'
          fail-on-error: 'true'
```

### With Code Scanning

```yaml
name: Baseline with Code Scanning

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  baseline:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
      pull-requests: write
      
    steps:
      - uses: actions/checkout@v4
      
      - name: Baseline Check
        id: baseline
        uses: omkardongre/baseline-developer-suite/packages/github-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          baseline-year: '2023'
          upload-sarif: 'true'
      
      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: ${{ steps.baseline.outputs.sarif-file }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github-token` | GitHub token for API access | No | `${{ github.token }}` |
| `baseline-year` | Target baseline year | No | `2023` |
| `allow-newly` | Allow newly available features | No | `true` |
| `allow-limited` | Allow limited support features | No | `false` |
| `fail-on-error` | Fail workflow on errors | No | `true` |
| `files` | File patterns to scan | No | `**/*.{js,ts,jsx,tsx,html,css}` |
| `upload-sarif` | Generate SARIF output | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `total-files` | Number of files scanned |
| `files-with-issues` | Files with compatibility issues |
| `total-violations` | Total violations found |
| `sarif-file` | Path to SARIF file (if generated) |

## Examples

### Strict Mode

```yaml
- uses: omkardongre/baseline-developer-suite/packages/github-action@v1
  with:
    baseline-year: '2022'
    allow-newly: 'false'
    allow-limited: 'false'
    fail-on-error: 'true'
```

### Scan Specific Files

```yaml
- uses: omkardongre/baseline-developer-suite/packages/github-action@v1
  with:
    files: 'src/**/*.js lib/**/*.ts'
```

### Warning Only Mode

```yaml
- uses: omkardongre/baseline-developer-suite/packages/github-action@v1
  with:
    fail-on-error: 'false'
```

## PR Comments

The action automatically posts a comment on pull requests with a summary:

```markdown
## 📊 Baseline Compatibility Report

| Metric | Value |
|--------|-------|
| Files Scanned | 42 |
| Files with Issues | 3 |
| Total Violations | 7 |
| Errors | 2 ❌ |
| Warnings | 5 ⚠️ |

### Issues by File

**src/app.js**
- 3 issue(s)
- Compatibility Score: 85%

**lib/utils.js**
- 2 issue(s)
- Compatibility Score: 90%
```

## SARIF Integration

The action generates SARIF files compatible with GitHub Code Scanning. Upload them using:

```yaml
- uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: baseline-results.sarif
```

Issues will appear in the Security tab and as annotations on PRs.

## Permissions

For PR comments and SARIF upload, ensure your workflow has:

```yaml
permissions:
  contents: read
  security-events: write  # For SARIF upload
  pull-requests: write    # For PR comments
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test
```

## License

MIT
