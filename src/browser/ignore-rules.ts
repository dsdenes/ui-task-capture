import {
  TASK_CAPTURE_ID_ATTRIBUTE,
  TASK_CAPTURE_IGNORE_ATTRIBUTE,
} from '../contracts/task-capture.js';

const MEANINGFUL_TAGS = new Set([
  'BUTTON',
  'A',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'OPTION',
  'SUMMARY',
  'LABEL',
  'SECTION',
  'ARTICLE',
  'MAIN',
  'ASIDE',
  'NAV',
  'HEADER',
  'FOOTER',
  'FORM',
  'FIELDSET',
  'TABLE',
  'THEAD',
  'TBODY',
  'TR',
  'TD',
  'TH',
  'UL',
  'OL',
  'LI',
  'DIALOG',
]);

const MEANINGFUL_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'combobox',
  'dialog',
  'tab',
  'tabpanel',
  'menuitem',
  'checkbox',
  'radio',
  'switch',
  'option',
  'row',
  'gridcell',
  'cell',
  'heading',
  'region',
]);

function toElement(target: EventTarget | null): Element | null {
  if (target instanceof Element) {
    return target;
  }

  if (target instanceof Node) {
    return target.parentElement;
  }

  return null;
}

export function isIgnoredElement(target: EventTarget | null): boolean {
  const element = toElement(target);
  return Boolean(element?.closest(`[${TASK_CAPTURE_IGNORE_ATTRIBUTE}]`));
}

function isMeaningfulElement(element: HTMLElement): boolean {
  if (element.hasAttribute(TASK_CAPTURE_ID_ATTRIBUTE)) {
    return true;
  }

  if (MEANINGFUL_TAGS.has(element.tagName)) {
    return true;
  }

  const role = element.getAttribute('role');
  if (role && MEANINGFUL_ROLES.has(role)) {
    return true;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width >= 48 && rect.height >= 24) {
    const hasEnoughContent =
      element.childElementCount > 1 ||
      (element.textContent?.trim().length ?? 0) >= 12 ||
      element.getAttribute('aria-label');

    if (hasEnoughContent) {
      return true;
    }
  }

  return false;
}

export function findMeaningfulElement(target: EventTarget | null): HTMLElement | null {
  const initial = toElement(target)?.closest<HTMLElement>('body *');

  if (!initial || isIgnoredElement(initial)) {
    return null;
  }

  const explicit = initial.closest<HTMLElement>(`[${TASK_CAPTURE_ID_ATTRIBUTE}]`);
  if (explicit && !isIgnoredElement(explicit)) {
    return explicit;
  }

  let current: HTMLElement | null = initial;
  while (current && current !== document.body) {
    if (!isIgnoredElement(current) && isMeaningfulElement(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return initial instanceof HTMLElement ? initial : null;
}
