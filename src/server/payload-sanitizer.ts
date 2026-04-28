import type { BrowserTaskCapturePayload } from '../contracts/task-capture.js';

function truncate(value: string | undefined, maxLength: number): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return undefined;
  }

  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}…`;
}

export function sanitizeTaskCapturePayload(
  input: BrowserTaskCapturePayload,
): BrowserTaskCapturePayload {
  return {
    ...input,
    routePath: truncate(input.routePath, 500) ?? '/',
    routeQuery: truncate(input.routeQuery, 2000),
    currentUrl: truncate(input.currentUrl, 2000) ?? input.routePath,
    pageTitle: truncate(input.pageTitle, 300),
    comment: truncate(input.comment, 4000) ?? '',
    commentTitleOverride: truncate(input.commentTitleOverride, 140),
    elementContext: {
      ...input.elementContext,
      accessibleName: truncate(input.elementContext.accessibleName, 240),
      textSnippet: truncate(input.elementContext.textSnippet, 500),
      stableCaptureId: truncate(input.elementContext.stableCaptureId, 200),
      domPath: truncate(input.elementContext.domPath, 1000) ?? 'unknown',
      classList: input.elementContext.classList
        .slice(0, 12)
        .map((value) => truncate(value, 100) ?? '')
        .filter(Boolean),
      ancestorChain: input.elementContext.ancestorChain.slice(0, 6).map((ancestor) => ({
        ...ancestor,
        tagName: truncate(ancestor.tagName, 50) ?? 'unknown',
        role: truncate(ancestor.role, 100),
        stableCaptureId: truncate(ancestor.stableCaptureId, 200),
        textSnippet: truncate(ancestor.textSnippet, 280),
      })),
    },
    appContext: input.appContext
      ? {
          tenantId: truncate(input.appContext.tenantId, 200),
          tenantName: truncate(input.appContext.tenantName, 200),
          userId: truncate(input.appContext.userId, 200),
        }
      : undefined,
  };
}
