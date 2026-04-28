import { beforeEach, describe, expect, it } from 'vitest';
import {
  TASK_CAPTURE_ID_ATTRIBUTE,
  TASK_CAPTURE_IGNORE_ATTRIBUTE,
} from '../contracts/task-capture.js';
import { findMeaningfulElement, isIgnoredElement } from './ignore-rules.js';

describe('findMeaningfulElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('prefers an explicit capture id ancestor', () => {
    document.body.innerHTML = `
      <div ${TASK_CAPTURE_ID_ATTRIBUTE}="profile-card">
        <span id="leaf">Edit profile</span>
      </div>
    `;

    const leaf = document.getElementById('leaf');
    const target = findMeaningfulElement(leaf);

    expect(target?.getAttribute(TASK_CAPTURE_ID_ATTRIBUTE)).toBe('profile-card');
  });

  it('walks up to a meaningful interactive ancestor', () => {
    document.body.innerHTML = `
      <button id="button"><span id="leaf">Save</span></button>
    `;

    const leaf = document.getElementById('leaf');
    const target = findMeaningfulElement(leaf);

    expect(target?.id).toBe('button');
  });

  it('ignores task capture chrome', () => {
    document.body.innerHTML = `
      <div ${TASK_CAPTURE_IGNORE_ATTRIBUTE}="true">
        <button id="ignored">Ignore me</button>
      </div>
    `;

    const ignored = document.getElementById('ignored');

    expect(isIgnoredElement(ignored)).toBe(true);
    expect(findMeaningfulElement(ignored)).toBeNull();
  });
});
