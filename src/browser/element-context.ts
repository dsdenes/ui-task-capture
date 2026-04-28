import {
  TASK_CAPTURE_ID_ATTRIBUTE,
  type BoundingBox,
  type BrowserTaskCaptureTarget,
  type CaptureAncestor,
  type CaptureElementContext,
} from '../contracts/task-capture.js';

function truncate(value: string | null | undefined, maxLength: number): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function getTextSnippet(element: HTMLElement): string | undefined {
  const labelLikeValue =
    element.getAttribute('aria-label') ||
    ('value' in element && typeof element.value === 'string' ? element.value : undefined) ||
    element.getAttribute('placeholder') ||
    element.textContent;

  return truncate(labelLikeValue, 240);
}

function getAccessibleName(element: HTMLElement): string | undefined {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const resolved = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' ');
    const fromLabelledBy = truncate(resolved, 240);
    if (fromLabelledBy) {
      return fromLabelledBy;
    }
  }

  return truncate(
    element.getAttribute('aria-label') ||
      element.getAttribute('alt') ||
      element.getAttribute('title') ||
      element.getAttribute('placeholder') ||
      element.textContent,
    240,
  );
}

function buildDomPath(element: HTMLElement): string {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body && segments.length < 7) {
    const captureId = current.getAttribute(TASK_CAPTURE_ID_ATTRIBUTE);
    if (captureId) {
      segments.unshift(`[${TASK_CAPTURE_ID_ATTRIBUTE}="${captureId}"]`);
      break;
    }

    const tagName = current.tagName.toLowerCase();
    const nextParent: HTMLElement | null = current.parentElement;
    if (!nextParent) {
      segments.unshift(tagName);
      break;
    }

    const currentTagName = current.tagName;
    const siblings = Array.from(nextParent.children).filter(
      (candidate): candidate is HTMLElement =>
        candidate instanceof HTMLElement && candidate.tagName === currentTagName,
    );
    const index = siblings.indexOf(current) + 1;
    segments.unshift(`${tagName}:nth-of-type(${Math.max(index, 1)})`);
    current = nextParent;
  }

  return segments.join(' > ');
}

function toBoundingBox(rect: DOMRect): BoundingBox {
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

function collectAncestorChain(element: HTMLElement): CaptureAncestor[] {
  const chain: CaptureAncestor[] = [];
  let current: HTMLElement | null = element.parentElement;

  while (current && current !== document.body && chain.length < 6) {
    chain.push({
      tagName: current.tagName.toLowerCase(),
      role: current.getAttribute('role') || undefined,
      stableCaptureId: current.getAttribute(TASK_CAPTURE_ID_ATTRIBUTE) || undefined,
      textSnippet: getTextSnippet(current),
    });

    current = current.parentElement;
  }

  return chain;
}

export function extractElementContext(element: HTMLElement): CaptureElementContext {
  const rect = element.getBoundingClientRect();

  return {
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute('role') || undefined,
    accessibleName: getAccessibleName(element),
    textSnippet: getTextSnippet(element),
    stableCaptureId: element.getAttribute(TASK_CAPTURE_ID_ATTRIBUTE) || undefined,
    domPath: buildDomPath(element),
    classList: Array.from(element.classList).slice(0, 12),
    boundingBox: toBoundingBox(rect),
    ancestorChain: collectAncestorChain(element),
  };
}

export function buildTargetSnapshot(element: HTMLElement): BrowserTaskCaptureTarget {
  return {
    element,
    context: extractElementContext(element),
  };
}
