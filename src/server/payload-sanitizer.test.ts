import { describe, expect, it } from 'vitest';
import type { BrowserTaskCapturePayload } from '../contracts/task-capture.js';
import { sanitizeTaskCapturePayload } from './payload-sanitizer.js';

const basePayload: BrowserTaskCapturePayload = {
  routePath: '/settings/users',
  routeQuery: 'filter=active',
  currentUrl: 'https://ai.1p.hu/settings/users?filter=active',
  pageTitle: 'Users',
  viewport: { width: 1440, height: 900 },
  scrollPosition: { x: 0, y: 120 },
  comment: 'Make the owner badge clearer.',
  elementContext: {
    tagName: 'button',
    role: 'button',
    accessibleName: 'Owner badge',
    textSnippet: 'Owner',
    stableCaptureId: 'owner-badge',
    domPath: '[data-task-capture-id="owner-badge"]',
    classList: ['pill', 'highlight'],
    boundingBox: { top: 20, left: 40, width: 140, height: 36 },
    ancestorChain: [
      { tagName: 'tr', role: 'row', stableCaptureId: 'user-row', textSnippet: 'Alice owner' },
    ],
  },
  appContext: {
    tenantId: 'tenant-1',
    tenantName: 'Example Org',
    userId: 'user-1',
  },
};

describe('sanitizeTaskCapturePayload', () => {
  it('passes well-formed payloads through unchanged', () => {
    expect(sanitizeTaskCapturePayload(basePayload)).toEqual(basePayload);
  });

  it('truncates oversized string fields with an ellipsis', () => {
    const longAccessibleName = 'a'.repeat(300);
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      elementContext: {
        ...basePayload.elementContext,
        accessibleName: longAccessibleName,
      },
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.elementContext.accessibleName).toHaveLength(240);
    expect(result.elementContext.accessibleName?.endsWith('…')).toBe(true);
  });

  it('falls back to sensible defaults when required string fields are empty', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      routePath: '',
      comment: '',
      elementContext: {
        ...basePayload.elementContext,
        domPath: '',
      },
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.routePath).toBe('/');
    expect(result.comment).toBe('');
    expect(result.elementContext.domPath).toBe('unknown');
  });

  it('does not fabricate a path for an empty currentUrl', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      routePath: '/settings/users',
      currentUrl: '',
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.currentUrl).toBe('');
    expect(result.currentUrl).not.toBe(payload.routePath);
  });

  it('slices classList to at most 12 entries and drops empty fragments', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      elementContext: {
        ...basePayload.elementContext,
        classList: [
          ...Array.from({ length: 15 }, (_, index) => `cls-${index}`),
          '',
          '   ',
        ],
      },
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.elementContext.classList).toHaveLength(12);
    expect(result.elementContext.classList.every((value) => value.length > 0)).toBe(true);
  });

  it('slices the ancestor chain to at most 6 entries', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      elementContext: {
        ...basePayload.elementContext,
        ancestorChain: Array.from({ length: 10 }, (_, index) => ({
          tagName: `t${index}`,
          role: 'row',
          stableCaptureId: `id-${index}`,
          textSnippet: `snippet-${index}`,
        })),
      },
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.elementContext.ancestorChain).toHaveLength(6);
    expect(result.elementContext.ancestorChain[0]?.tagName).toBe('t0');
    expect(result.elementContext.ancestorChain[5]?.tagName).toBe('t5');
  });

  it('truncates ancestor fields and falls back the tag name to unknown', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      elementContext: {
        ...basePayload.elementContext,
        ancestorChain: [
          { tagName: '', role: 'r'.repeat(120), textSnippet: 's'.repeat(300) },
        ],
      },
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.elementContext.ancestorChain[0]?.tagName).toBe('unknown');
    expect(result.elementContext.ancestorChain[0]?.role).toHaveLength(100);
    expect(result.elementContext.ancestorChain[0]?.textSnippet).toHaveLength(280);
  });

  it('returns undefined appContext when the input has none', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      appContext: undefined,
    };

    expect(sanitizeTaskCapturePayload(payload).appContext).toBeUndefined();
  });

  it('truncates appContext fields when present', () => {
    const payload: BrowserTaskCapturePayload = {
      ...basePayload,
      appContext: {
        tenantId: 't'.repeat(300),
        tenantName: 'n'.repeat(300),
        userId: 'u'.repeat(300),
      },
    };

    const result = sanitizeTaskCapturePayload(payload);

    expect(result.appContext?.tenantId).toHaveLength(200);
    expect(result.appContext?.tenantName).toHaveLength(200);
    expect(result.appContext?.userId).toHaveLength(200);
  });
});
