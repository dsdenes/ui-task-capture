import { TASK_CAPTURE_IGNORE_ATTRIBUTE, type BoundingBox } from '../contracts/task-capture.js';

const OVERLAY_ID = 'ui-task-capture-overlay';

export class HighlightOverlay {
  private readonly root: HTMLDivElement;
  private readonly label: HTMLDivElement;

  constructor() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.remove();
    }

    this.root = document.createElement('div');
    this.root.id = OVERLAY_ID;
    this.root.setAttribute(TASK_CAPTURE_IGNORE_ATTRIBUTE, 'true');
    Object.assign(this.root.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '0',
      height: '0',
      pointerEvents: 'none',
      zIndex: '9999',
      border: '2px solid #f97316',
      borderRadius: '12px',
      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.08)',
      transition: 'transform 120ms ease, width 120ms ease, height 120ms ease',
      display: 'none',
    });

    this.label = document.createElement('div');
    this.label.setAttribute(TASK_CAPTURE_IGNORE_ATTRIBUTE, 'true');
    Object.assign(this.label.style, {
      position: 'absolute',
      top: '-32px',
      left: '0',
      maxWidth: '280px',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#0f172a',
      color: '#f8fafc',
      fontSize: '12px',
      fontWeight: '600',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });

    this.root.appendChild(this.label);
    document.body.appendChild(this.root);
  }

  show(box: BoundingBox, label?: string) {
    this.root.style.display = 'block';
    this.root.style.transform = `translate(${box.left}px, ${box.top}px)`;
    this.root.style.width = `${Math.max(box.width, 1)}px`;
    this.root.style.height = `${Math.max(box.height, 1)}px`;

    if (label) {
      this.label.textContent = label;
      this.label.style.display = 'block';
    } else {
      this.label.style.display = 'none';
    }
  }

  hide() {
    this.root.style.display = 'none';
  }

  destroy() {
    this.root.remove();
  }
}
