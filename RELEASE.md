# Release

This package is developed in `~/ui-task-capture`, which should track `dsdenes/ui-task-capture`.
The copy under `aijourney/enai/packages/ui-task-capture` is the synced mirror consumed by the monorepo.

## Bootstrap the local source repo

From the monorepo root:

```bash
pnpm run ui-task-capture:sync-repo
```

That command ensures `~/ui-task-capture` exists as a local clone of `dsdenes/ui-task-capture`
and seeds it from the current monorepo mirror.

## Sync the monorepo mirror

From the monorepo root:

```bash
pnpm run ui-task-capture:sync-repo
```

That command syncs the working tree from `~/ui-task-capture` back into
`aijourney/enai/packages/ui-task-capture` so the monorepo apps and Docker builds use the latest package code.

## Manual npm release

Run these commands in `~/ui-task-capture`:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
npm pack --dry-run
npm version <new-version>
git push origin main --follow-tags
npm publish --access public
```

## Versioning

- Bump the version in `~/ui-task-capture/package.json` before publishing.
- Sync the monorepo mirror after package changes and before validating monorepo consumers.
