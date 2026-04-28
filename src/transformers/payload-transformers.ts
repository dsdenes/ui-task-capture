import type {
  CreateUiTaskCaptureInput,
  UiTaskCaptureAncestor,
  UiTaskCaptureAppContext,
  UiTaskCaptureElementContext,
} from '../contracts/create-ui-task-capture.js';
import type {
  BrowserTaskCapturePayload,
  CaptureAncestor,
  CaptureElementContext,
} from '../contracts/task-capture.js';

function toBrowserAncestor(ancestor: UiTaskCaptureAncestor): CaptureAncestor {
  return {
    tagName: ancestor.tag_name,
    role: ancestor.role,
    stableCaptureId: ancestor.stable_capture_id,
    textSnippet: ancestor.text_snippet,
  };
}

function toCaptureAncestor(ancestor: CaptureAncestor): UiTaskCaptureAncestor {
  return {
    tag_name: ancestor.tagName,
    role: ancestor.role,
    stable_capture_id: ancestor.stableCaptureId,
    text_snippet: ancestor.textSnippet,
  };
}

function toBrowserElementContext(
  elementContext: UiTaskCaptureElementContext,
): CaptureElementContext {
  return {
    tagName: elementContext.tag_name,
    role: elementContext.role,
    accessibleName: elementContext.accessible_name,
    textSnippet: elementContext.text_snippet,
    stableCaptureId: elementContext.stable_capture_id,
    domPath: elementContext.dom_path,
    classList: [...elementContext.class_list],
    boundingBox: { ...elementContext.bounding_box },
    ancestorChain: elementContext.ancestor_chain.map(toBrowserAncestor),
  };
}

function toCaptureElementContext(
  elementContext: CaptureElementContext,
): UiTaskCaptureElementContext {
  return {
    tag_name: elementContext.tagName,
    role: elementContext.role,
    accessible_name: elementContext.accessibleName,
    text_snippet: elementContext.textSnippet,
    stable_capture_id: elementContext.stableCaptureId,
    dom_path: elementContext.domPath,
    class_list: [...elementContext.classList],
    bounding_box: { ...elementContext.boundingBox },
    ancestor_chain: elementContext.ancestorChain.map(toCaptureAncestor),
  };
}

function toBrowserAppContext(
  appContext: UiTaskCaptureAppContext | undefined,
): BrowserTaskCapturePayload['appContext'] {
  if (!appContext) {
    return undefined;
  }

  return {
    tenantId: appContext.tenant_id,
    tenantName: appContext.tenant_name,
    userId: appContext.user_id,
  };
}

function toCaptureAppContext(
  appContext: BrowserTaskCapturePayload['appContext'],
): CreateUiTaskCaptureInput['app_context'] {
  if (!appContext) {
    return undefined;
  }

  return {
    tenant_id: appContext.tenantId,
    tenant_name: appContext.tenantName,
    user_id: appContext.userId,
  };
}

export function toBrowserTaskCapturePayload(
  input: CreateUiTaskCaptureInput,
): BrowserTaskCapturePayload {
  return {
    routePath: input.route_path,
    routeQuery: input.route_query,
    currentUrl: input.current_url,
    pageTitle: input.page_title,
    viewport: { ...input.viewport },
    scrollPosition: { ...input.scroll_position },
    comment: input.comment,
    commentTitleOverride: input.comment_title_override,
    elementContext: toBrowserElementContext(input.element_context),
    appContext: toBrowserAppContext(input.app_context),
  };
}

export function toCreateUiTaskCaptureInput(
  input: BrowserTaskCapturePayload,
): CreateUiTaskCaptureInput {
  return {
    route_path: input.routePath,
    route_query: input.routeQuery,
    current_url: input.currentUrl,
    page_title: input.pageTitle,
    viewport: { ...input.viewport },
    scroll_position: { ...input.scrollPosition },
    comment: input.comment,
    comment_title_override: input.commentTitleOverride,
    element_context: toCaptureElementContext(input.elementContext),
    app_context: toCaptureAppContext(input.appContext),
  };
}
