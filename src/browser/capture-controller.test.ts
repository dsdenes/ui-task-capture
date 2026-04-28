import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskCaptureController } from './capture-controller.js';

describe('TaskCaptureController', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section>
        <button id="target-button"><span id="target-leaf">Save</span></button>
      </section>
    `;
  });

  it('captures clicks on meaningful elements and invokes the selection callback', () => {
    const onTargetSelected = vi.fn();
    const controller = new TaskCaptureController({ onTargetSelected });

    controller.start();

    const leaf = document.getElementById('target-leaf') as HTMLElement;
    leaf.dispatchEvent(new Event('pointermove', { bubbles: true }));
    leaf.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(onTargetSelected).toHaveBeenCalledTimes(1);
    expect(onTargetSelected.mock.calls[0]?.[0].context.tagName).toBe('button');

    controller.destroy();
  });

  it('invokes the escape callback while active', () => {
    const onEscape = vi.fn();
    const controller = new TaskCaptureController({ onEscape });

    controller.start();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(onEscape).toHaveBeenCalledTimes(1);

    controller.destroy();
  });

  it('closes the locked selection on outside click without triggering page interaction', () => {
    const onOutsideInteraction = vi.fn();
    const controller = new TaskCaptureController({ onOutsideInteraction });

    controller.start();

    const leaf = document.getElementById('target-leaf') as HTMLElement;
    leaf.dispatchEvent(new Event('pointermove', { bubbles: true }));
    leaf.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const section = document.querySelector('section') as HTMLElement;
    const outsideClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    section.dispatchEvent(outsideClick);

    expect(onOutsideInteraction).toHaveBeenCalledTimes(1);
    expect(outsideClick.defaultPrevented).toBe(true);

    controller.destroy();
  });
});
