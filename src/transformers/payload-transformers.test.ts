import type { CreateUiTaskCaptureInput } from '../contracts/create-ui-task-capture.js';
import type { BrowserTaskCapturePayload } from '../contracts/task-capture.js';
import { toBrowserTaskCapturePayload, toCreateUiTaskCaptureInput } from './payload-transformers.js';
import { describe, expect, it } from 'vitest';

const sampleBrowserPayload: BrowserTaskCapturePayload = {
  routePath: '/settings/users',
  routeQuery: 'filter=active',
  currentUrl: 'https://ai.1p.hu/settings/users?filter=active',
  pageTitle: 'Users',
  viewport: { width: 1440, height: 900 },
  scrollPosition: { x: 0, y: 120 },
  comment: 'Make the owner badge clearer.',
  commentTitleOverride: 'Clarify owner badge',
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

const sampleCreateInput: CreateUiTaskCaptureInput = {
  route_path: '/settings/users',
  route_query: 'filter=active',
  current_url: 'https://ai.1p.hu/settings/users?filter=active',
  page_title: 'Users',
  viewport: { width: 1440, height: 900 },
  scroll_position: { x: 0, y: 120 },
  comment: 'Make the owner badge clearer.',
  comment_title_override: 'Clarify owner badge',
  element_context: {
    tag_name: 'button',
    role: 'button',
    accessible_name: 'Owner badge',
    text_snippet: 'Owner',
    stable_capture_id: 'owner-badge',
    dom_path: '[data-task-capture-id="owner-badge"]',
    class_list: ['pill', 'highlight'],
    bounding_box: { top: 20, left: 40, width: 140, height: 36 },
    ancestor_chain: [
      {
        tag_name: 'tr',
        role: 'row',
        stable_capture_id: 'user-row',
        text_snippet: 'Alice Example owner',
      },
    ],
  },
  app_context: {
    tenant_id: 'tenant-1',
    tenant_name: 'Example Org',
    user_id: 'user-1',
  },
};

describe('payload transformers', () => {
  it('converts browser capture payloads into shared capture input', () => {
    expect(toCreateUiTaskCaptureInput(sampleBrowserPayload)).toEqual(sampleCreateInput);
  });

  it('converts shared capture input into browser capture payloads', () => {
    expect(toBrowserTaskCapturePayload(sampleCreateInput)).toEqual(sampleBrowserPayload);
  });

  it('round-trips nested capture data without losing fields', () => {
    expect(toBrowserTaskCapturePayload(toCreateUiTaskCaptureInput(sampleBrowserPayload))).toEqual(
      sampleBrowserPayload,
    );
    expect(toCreateUiTaskCaptureInput(toBrowserTaskCapturePayload(sampleCreateInput))).toEqual(
      sampleCreateInput,
    );
  });

  it('preserves omitted optional app context and empty ancestor chains', () => {
    const minimalPayload: BrowserTaskCapturePayload = {
      ...sampleBrowserPayload,
      routeQuery: undefined,
      pageTitle: undefined,
      commentTitleOverride: undefined,
      elementContext: {
        ...sampleBrowserPayload.elementContext,
        role: undefined,
        accessibleName: undefined,
        textSnippet: undefined,
        stableCaptureId: undefined,
        classList: [],
        ancestorChain: [],
      },
      appContext: undefined,
    };

    expect(toCreateUiTaskCaptureInput(minimalPayload)).toEqual({
      route_path: '/settings/users',
      route_query: undefined,
      current_url: 'https://ai.1p.hu/settings/users?filter=active',
      page_title: undefined,
      viewport: { width: 1440, height: 900 },
      scroll_position: { x: 0, y: 120 },
      comment: 'Make the owner badge clearer.',
      comment_title_override: undefined,
      element_context: {
        tag_name: 'button',
        role: undefined,
        accessible_name: undefined,
        text_snippet: undefined,
        stable_capture_id: undefined,
        dom_path: '[data-task-capture-id="owner-badge"]',
        class_list: [],
        bounding_box: { top: 20, left: 40, width: 140, height: 36 },
        ancestor_chain: [],
      },
      app_context: undefined,
    });
  });
});
