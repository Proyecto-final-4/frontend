<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Code quality — mandatory before every commit

Run these two commands and fix all errors before committing. The CI pipeline enforces both and will fail if either reports issues.

```bash
npm run format   # auto-formats all files with Prettier (run first)
npm run lint     # ESLint — must exit with 0 errors
```

Never commit with lint errors or unformatted files.
