# @dsdenes/ui-task-capture

Reusable UI issue capture primitives for browser apps and server-side issue creation.

This package owns the portable task-capture contract, so another project can reuse it without depending on the Aijourney shared package.

The active development source of truth lives in `~/ui-task-capture` (typically a clone of `dsdenes/ui-task-capture`).
The copy in the `aijourney` monorepo under `enai/packages/ui-task-capture` is the synced mirror used by the local app consumers and Docker builds.

## What it provides

- `TaskCaptureController` for hover/select capture mode in the browser
- `TASK_CAPTURE_ID_ATTRIBUTE` and `TASK_CAPTURE_IGNORE_ATTRIBUTE` for stable targeting
- `toCreateUiTaskCaptureInput` and `toBrowserTaskCapturePayload` to translate browser payloads into API payloads
- `createUiTaskCaptureSchema` and related types for validating server input
- `buildIssueDraft` and `GitHubIssuesClient` for turning a capture into a GitHub issue

## Minimal browser integration

```ts
import {
  TaskCaptureController,
  type BrowserTaskCaptureTarget,
  toCreateUiTaskCaptureInput,
  type CreateUiTaskCaptureInput,
} from '@dsdenes/ui-task-capture';

let selectedTarget: BrowserTaskCaptureTarget | null = null;

const controller = new TaskCaptureController({
  onTargetSelected(target) {
    selectedTarget = target;
  },
  onEscape() {
    controller.stop();
  },
});

controller.start();

function buildInput(comment: string): CreateUiTaskCaptureInput {
  if (!selectedTarget) {
    throw new Error('No target selected');
  }

  return toCreateUiTaskCaptureInput({
    routePath: window.location.pathname,
    routeQuery: window.location.search.replace(/^\?/, '') || undefined,
    currentUrl: window.location.href,
    pageTitle: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scrollPosition: { x: Math.round(window.scrollX), y: Math.round(window.scrollY) },
    comment,
    elementContext: selectedTarget.context,
  });
}
```

## Minimal server integration

```ts
import {
  GitHubIssuesClient,
  buildIssueDraft,
  createUiTaskCaptureSchema,
  toBrowserTaskCapturePayload,
} from '@dsdenes/ui-task-capture';

const input = createUiTaskCaptureSchema.parse(request.body);
const capture = toBrowserTaskCapturePayload(input);

const client = new GitHubIssuesClient({
  token: process.env.GITHUB_TOKEN!,
  owner: 'your-org',
  repo: 'your-repo',
});

const issue = await client.createIssue(
  buildIssueDraft({
    capture,
    submittedBy: { userId: user.id, email: user.email },
  }),
);
```

## Integration notes

- Mark stable elements with `data-task-capture-id` so issue reports reference meaningful targets.
- Mark the widget or popover shell with `data-task-capture-ignore` so the capture controller ignores its own UI.
- Install from npm with `pnpm add @dsdenes/ui-task-capture` or `npm install @dsdenes/ui-task-capture`.
- Develop the package in `~/ui-task-capture`, then sync the monorepo mirror from the `aijourney` root with `pnpm run ui-task-capture:sync-repo`.
- The package targets Node `>=24 <25` for server-side helpers and modern browser runtimes for the DOM capture layer.
