export const TASK_CAPTURE_IGNORE_ATTRIBUTE = 'data-task-capture-ignore';
export const TASK_CAPTURE_ID_ATTRIBUTE = 'data-task-capture-id';

export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CaptureAncestor {
  tagName: string;
  role?: string;
  stableCaptureId?: string;
  textSnippet?: string;
}

export interface CaptureElementContext {
  tagName: string;
  role?: string;
  accessibleName?: string;
  textSnippet?: string;
  stableCaptureId?: string;
  domPath: string;
  classList: string[];
  boundingBox: BoundingBox;
  ancestorChain: CaptureAncestor[];
}

export interface BrowserTaskCaptureTarget {
  element: HTMLElement;
  context: CaptureElementContext;
}

export interface BrowserTaskCapturePayload {
  routePath: string;
  routeQuery?: string;
  currentUrl: string;
  pageTitle?: string;
  viewport: {
    width: number;
    height: number;
  };
  scrollPosition: {
    x: number;
    y: number;
  };
  comment: string;
  commentTitleOverride?: string;
  elementContext: CaptureElementContext;
  appContext?: {
    tenantId?: string;
    tenantName?: string;
    userId?: string;
  };
}
