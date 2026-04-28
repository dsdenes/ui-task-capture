# Release

This package is authored in the `aijourney` monorepo under `enai/packages/ui-task-capture` and mirrored to `dsdenes/ui-task-capture`.

## Mirror the standalone repo

From the monorepo root:

```bash
pnpm run ui-task-capture:sync-repo
```

That command subtree-pushes the package directory to `git@github.com:dsdenes/ui-task-capture.git`.
It syncs committed `HEAD` state only and intentionally refuses to run with uncommitted task-capture changes.

## Manual npm release

Run these commands in the standalone `dsdenes/ui-task-capture` repository root:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
npm pack --dry-run
npm publish --access public
```

## Versioning

- Bump the version in `package.json` before syncing and publishing.
- Tag the standalone repository after a successful publish.