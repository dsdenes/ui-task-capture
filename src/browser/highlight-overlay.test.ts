import { beforeEach, describe, expect, it } from 'vitest';
import type { BoundingBox } from '../contracts/task-capture.js';
import { HighlightOverlay } from './highlight-overlay.js';

const OVERLAY_ID = 'ui-task-capture-overlay';

describe('HighlightOverlay', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('appends a single overlay root to the document body', () => {
    const overlay = new HighlightOverlay();

    const root = document.getElementById(OVERLAY_ID);
    expect(root).not.toBeNull();
    expect(root?.getAttribute('data-task-capture-ignore')).toBe('true');

    overlay.destroy();
  });

  it('removes a pre-existing overlay before creating a new one', () => {
    const first = new HighlightOverlay();
    const firstNode = document.getElementById(OVERLAY_ID);

    const second = new HighlightOverlay();
    const secondNode = document.getElementById(OVERLAY_ID);

    expect(document.querySelectorAll(`#${OVERLAY_ID}`)).toHaveLength(1);
    expect(secondNode).not.toBe(firstNode);

    second.destroy();
    first.destroy();
  });

  it('shows the box and label when provided', () => {
    const overlay = new HighlightOverlay();
    const box: BoundingBox = { top: 10, left: 20, width: 100, height: 50 };

    overlay.show(box, 'button • save');

    const root = document.getElementById(OVERLAY_ID) as HTMLElement;
    expect(root.style.display).toBe('block');
    expect(root.style.transform).toBe('translate(20px, 10px)');
    expect(root.style.width).toBe('100px');
    expect(root.style.height).toBe('50px');

    const label = root.firstElementChild as HTMLElement;
    expect(label.textContent).toBe('button • save');
    expect(label.style.display).toBe('block');

    overlay.destroy();
  });

  it('hides the label when no label is provided', () => {
    const overlay = new HighlightOverlay();
    const box: BoundingBox = { top: 0, left: 0, width: 10, height: 10 };

    overlay.show(box);

    const root = document.getElementById(OVERLAY_ID) as HTMLElement;
    expect(root.style.display).toBe('block');

    const label = root.firstElementChild as HTMLElement;
    expect(label.style.display).toBe('none');

    overlay.destroy();
  });

  it('clamps a zero-size box to a 1px render box', () => {
    const overlay = new HighlightOverlay();
    const box: BoundingBox = { top: 0, left: 0, width: 0, height: 0 };

    overlay.show(box);

    const root = document.getElementById(OVERLAY_ID) as HTMLElement;
    expect(root.style.width).toBe('1px');
    expect(root.style.height).toBe('1px');

    overlay.destroy();
  });

  it('hide() sets the root display to none', () => {
    const overlay = new HighlightOverlay();
    overlay.show({ top: 0, left: 0, width: 10, height: 10 }, 'x');

    overlay.hide();

    const root = document.getElementById(OVERLAY_ID) as HTMLElement;
    expect(root.style.display).toBe('none');

    overlay.destroy();
  });

  it('destroy() removes the root from the document', () => {
    const overlay = new HighlightOverlay();

    overlay.destroy();

    expect(document.getElementById(OVERLAY_ID)).toBeNull();
  });
});
