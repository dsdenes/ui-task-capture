import { describe, expect, it } from 'vitest';
import type { BrowserTaskCapturePayload } from '../contracts/task-capture.js';
import { buildIssueBody, buildIssueDraft, deriveIssueTitle } from './issue-body-builder.js';

const sampleCapture: BrowserTaskCapturePayload = {
  routePath: '/settings/users',
  routeQuery: 'filter=active',
  currentUrl: 'https://ai.1p.hu/settings/users?filter=active',
  pageTitle: 'Users',
  viewport: { width: 1440, height: 900 },
  scrollPosition: { x: 0, y: 120 },
  comment: 'The owner badge should be clearer and clickable.',
  commentTitleOverride: undefined,
  elementContext: {
    tagName: 'button',
    role: 'button',
    accessibleName: 'Owner badge',
    textSnippet: 'Owner',
    stableCaptureId: 'user-row-role-pill',
    domPath: '[data-task-capture-id="user-row-role-pill"]',
    classList: ['pill', 'highlight'],
    boundingBox: { top: 20, left: 40, width: 160, height: 42 },
    ancestorChain: [
      {
        tagName: 'tr',
        role: 'row',
        stableCaptureId: 'user-row',
        textSnippet: 'Alice Example owner',
      },
    ],
  },
  appContext: {
    tenantId: 'tenant-1',
    tenantName: 'Example Org',
    userId: 'user-1',
  },
};

describe('issue body builder', () => {
  it('derives a title from the comment when no override exists', () => {
    expect(deriveIssueTitle(sampleCapture)).toBe(
      'The owner badge should be clearer and clickable.',
    );
  });

  it('builds a markdown issue body with key context', () => {
    const body = buildIssueBody({
      capture: sampleCapture,
      submittedBy: { userId: 'user-1', email: 'admin@example.com' },
    });

    expect(body).toContain('## Requested Change');
    expect(body).toContain('- Current URL: https://ai.1p.hu/settings/users?filter=active');
    expect(body).toContain('- Route: /settings/users?filter=active');
    expect(body).toContain('Owner badge');
    expect(body).toContain('Example Org');
    expect(body).toContain('user-row-role-pill');
  });

  it('returns a full draft with labels', () => {
    const draft = buildIssueDraft(
      {
        capture: sampleCapture,
        submittedBy: { userId: 'user-1', email: 'admin@example.com' },
      },
      ['ui-task-capture'],
    );

    expect(draft.title).toBe('The owner badge should be clearer and clickable.');
    expect(draft.labels).toEqual(['ui-task-capture']);
    expect(draft.body).toContain('Requested Change');
  });
});
