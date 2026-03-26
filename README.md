# Frontend

Next.js frontend with commit hooks and CI validation for code quality and environment variables.

## Requirements

- Node.js 22+
- npm

## Local setup

```bash
npm install
```

## Available scripts

- `npm run dev`: start local development server
- `npm run build`: build for production
- `npm run start`: run production build
- `npm run lint`: run ESLint
- `npm run format`: format files with Prettier
- `npm run format:check`: validate formatting with Prettier
- `npm run test`: run tests with Vitest
- `npm run validate:env`: validate required environment variables

## Required environment variables

Create a local `.env.local` file based on `.env.example`:

```env
BACKEND_JAVA_ENDPOINT=<replace-with-java-backend-endpoint>
OPENAI_API_KEY=<replace-with-openai-api-key>
```

## Commit hooks

This repository uses Husky hooks:

- `pre-commit`: blocks commits when:
  - potential OpenAI secret is detected in staged changes
  - lint fails
  - formatting check fails
- `commit-msg`: validates commit message prefixes using commitlint

Allowed commit prefixes:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

Example:

```bash
git commit -m "feat: add authentication form"
```

## CI (GitHub Actions)

Workflow file: `.github/workflows/ci.yml`

The CI pipeline runs:

1. Environment variable validation
2. Lint
3. Format check
4. Tests

Configure these values in GitHub repository settings:

- Repository variable: `BACKEND_JAVA_ENDPOINT`
- Repository secret: `OPENAI_API_KEY`
