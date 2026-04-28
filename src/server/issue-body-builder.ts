import type { BrowserTaskCapturePayload } from '../contracts/task-capture.js';
import type { GitHubIssueDraft, IssueBodyContext } from '../contracts/github-issue.js';
import { sanitizeTaskCapturePayload } from './payload-sanitizer.js';

function deriveTargetLabel(capture: BrowserTaskCapturePayload): string {
  return (
    capture.elementContext.accessibleName ||
    capture.elementContext.textSnippet ||
    capture.elementContext.stableCaptureId ||
    capture.elementContext.tagName
  );
}

function normalizeTitleText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function deriveIssueTitle(capture: BrowserTaskCapturePayload): string {
  const explicit = normalizeTitleText(capture.commentTitleOverride || '');
  if (explicit) {
    return explicit;
  }

  const commentSummary = normalizeTitleText(capture.comment);
  if (commentSummary) {
    return commentSummary.slice(0, 140);
  }

  const targetLabel = deriveTargetLabel(capture);
  return targetLabel.slice(0, 140);
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'None';
}

function formatAncestorChain(capture: BrowserTaskCapturePayload): string {
  if (capture.elementContext.ancestorChain.length === 0) {
    return '- none';
  }

  return capture.elementContext.ancestorChain
    .map((ancestor) => {
      const parts = [ancestor.tagName];
      if (ancestor.role) {
        parts.push(`role=${ancestor.role}`);
      }
      if (ancestor.stableCaptureId) {
        parts.push(`capture_id=${ancestor.stableCaptureId}`);
      }
      if (ancestor.textSnippet) {
        parts.push(`text="${ancestor.textSnippet}"`);
      }
      return `- ${parts.join(' | ')}`;
    })
    .join('\n');
}

export function buildIssueBody(context: IssueBodyContext): string {
  const capture = sanitizeTaskCapturePayload(context.capture);

  return [
    '## Requested Change',
    '',
    capture.comment,
    '',
    '## Capture Context',
    '',
    `- Current URL: ${capture.currentUrl}`,
    `- Route: ${capture.routePath}${capture.routeQuery ? `?${capture.routeQuery}` : ''}`,
    `- Page title: ${capture.pageTitle || 'Unknown'}`,
    `- Submitted by: ${context.submittedBy.email || context.submittedBy.userId}`,
    capture.appContext?.tenantName
      ? `- Tenant: ${capture.appContext.tenantName}`
      : '- Tenant: Unknown',
    '',
    '## Selected UI Element',
    '',
    `- Tag: ${capture.elementContext.tagName}`,
    `- Role: ${capture.elementContext.role || 'None'}`,
    `- Accessible name: ${capture.elementContext.accessibleName || 'None'}`,
    `- Visible text: ${capture.elementContext.textSnippet || 'None'}`,
    `- Stable capture id: ${capture.elementContext.stableCaptureId || 'None'}`,
    `- DOM path: ${capture.elementContext.domPath}`,
    `- CSS classes: ${formatList(capture.elementContext.classList)}`,
    `- Bounding box: top=${capture.elementContext.boundingBox.top}, left=${capture.elementContext.boundingBox.left}, width=${capture.elementContext.boundingBox.width}, height=${capture.elementContext.boundingBox.height}`,
    `- Viewport: ${capture.viewport.width}x${capture.viewport.height}`,
    `- Scroll position: x=${capture.scrollPosition.x}, y=${capture.scrollPosition.y}`,
    '',
    '## Ancestor Chain',
    '',
    formatAncestorChain(capture),
  ].join('\n');
}

export function buildIssueDraft(context: IssueBodyContext, labels?: string[]): GitHubIssueDraft {
  return {
    title: deriveIssueTitle(context.capture),
    body: buildIssueBody(context),
    labels,
  };
}
