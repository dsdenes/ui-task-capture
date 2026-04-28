import { beforeEach, describe, expect, it } from 'vitest';
import { TASK_CAPTURE_ID_ATTRIBUTE } from '../contracts/task-capture.js';
import { extractElementContext } from './element-context.js';

describe('extractElementContext', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts accessible name, path, classes, and ancestors', () => {
    document.body.innerHTML = `
      <section class="card" ${TASK_CAPTURE_ID_ATTRIBUTE}="settings-panel">
        <button id="target" class="primary large" aria-label="Save settings">Save</button>
      </section>
    `;

    const element = document.getElementById('target') as HTMLElement;
    const context = extractElementContext(element);

    expect(context.tagName).toBe('button');
    expect(context.accessibleName).toBe('Save settings');
    expect(context.domPath).toContain(`${TASK_CAPTURE_ID_ATTRIBUTE}`);
    expect(context.classList).toEqual(['primary', 'large']);
    expect(context.ancestorChain[0]?.stableCaptureId).toBe('settings-panel');
  });
});
