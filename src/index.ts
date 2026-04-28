export {
  TASK_CAPTURE_ID_ATTRIBUTE,
  TASK_CAPTURE_IGNORE_ATTRIBUTE,
  type BoundingBox,
  type BrowserTaskCapturePayload,
  type BrowserTaskCaptureTarget,
  type CaptureAncestor,
  type CaptureElementContext,
} from './contracts/task-capture.js';
export {
  createUiTaskCaptureResponseSchema,
  createUiTaskCaptureSchema,
  uiTaskCaptureAncestorSchema,
  uiTaskCaptureAppContextSchema,
  uiTaskCaptureBoundingBoxSchema,
  uiTaskCaptureElementContextSchema,
  uiTaskCaptureScrollPositionSchema,
  uiTaskCaptureViewportSchema,
  type CreateUiTaskCaptureInput,
  type CreateUiTaskCaptureResult,
  type UiTaskCapture,
  type UiTaskCaptureAncestor,
  type UiTaskCaptureAppContext,
  type UiTaskCaptureBoundingBox,
  type UiTaskCaptureElementContext,
  type UiTaskCaptureScrollPosition,
  type UiTaskCaptureStatus,
  type UiTaskCaptureViewport,
} from './contracts/create-ui-task-capture.js';
export type {
  GitHubIssueClient,
  GitHubIssueDraft,
  GitHubIssueResult,
  IssueBodyContext,
} from './contracts/github-issue.js';
export {
  TaskCaptureController,
  type TaskCaptureControllerOptions,
} from './browser/capture-controller.js';
export { HighlightOverlay } from './browser/highlight-overlay.js';
export { buildTargetSnapshot, extractElementContext } from './browser/element-context.js';
export { findMeaningfulElement, isIgnoredElement } from './browser/ignore-rules.js';
export { buildIssueBody, buildIssueDraft, deriveIssueTitle } from './server/issue-body-builder.js';
export {
  GitHubIssuesClient,
  type GitHubIssuesClientOptions,
} from './server/github-issues-client.js';
export { sanitizeTaskCapturePayload } from './server/payload-sanitizer.js';
export {
  toBrowserTaskCapturePayload,
  toCreateUiTaskCaptureInput,
} from './transformers/payload-transformers.js';
