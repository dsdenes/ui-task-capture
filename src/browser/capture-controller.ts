import type { BrowserTaskCaptureTarget } from '../contracts/task-capture.js';
import { findMeaningfulElement, isIgnoredElement } from './ignore-rules.js';
import { buildTargetSnapshot } from './element-context.js';
import { HighlightOverlay } from './highlight-overlay.js';

export interface TaskCaptureControllerOptions {
  onHoverTargetChanged?: (target: BrowserTaskCaptureTarget | null) => void;
  onTargetSelected?: (target: BrowserTaskCaptureTarget) => void;
  onEscape?: () => void;
  onOutsideInteraction?: () => void;
}

export class TaskCaptureController {
  private readonly overlay = new HighlightOverlay();
  private readonly options: TaskCaptureControllerOptions;
  private hoveredTarget: BrowserTaskCaptureTarget | null = null;
  private lockedTarget: BrowserTaskCaptureTarget | null = null;
  private active = false;
  private previousCursor = '';

  constructor(options: TaskCaptureControllerOptions = {}) {
    this.options = options;
  }

  start() {
    if (this.active) {
      return;
    }

    this.active = true;
    this.previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';

    document.addEventListener('pointermove', this.handlePointerMove, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('submit', this.handleSubmit, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    window.addEventListener('scroll', this.handleViewportChange, true);
    window.addEventListener('resize', this.handleViewportChange, true);
  }

  stop() {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.hoveredTarget = null;
    this.lockedTarget = null;
    document.body.style.cursor = this.previousCursor;
    this.overlay.hide();

    document.removeEventListener('pointermove', this.handlePointerMove, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('submit', this.handleSubmit, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('scroll', this.handleViewportChange, true);
    window.removeEventListener('resize', this.handleViewportChange, true);
    this.options.onHoverTargetChanged?.(null);
  }

  destroy() {
    this.stop();
    this.overlay.destroy();
  }

  resume() {
    this.lockedTarget = null;
    if (this.hoveredTarget) {
      this.render(this.hoveredTarget);
    } else {
      this.overlay.hide();
    }
  }

  refreshLockedTarget() {
    if (!this.lockedTarget) {
      return;
    }

    this.lockedTarget = buildTargetSnapshot(this.lockedTarget.element);
    this.render(this.lockedTarget);
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.active || this.lockedTarget) {
      return;
    }

    const element = findMeaningfulElement(event.target);
    if (!element) {
      this.hoveredTarget = null;
      this.overlay.hide();
      this.options.onHoverTargetChanged?.(null);
      return;
    }

    if (this.hoveredTarget?.element === element) {
      this.hoveredTarget = buildTargetSnapshot(element);
      this.render(this.hoveredTarget);
      return;
    }

    this.hoveredTarget = buildTargetSnapshot(element);
    this.render(this.hoveredTarget);
    this.options.onHoverTargetChanged?.(this.hoveredTarget);
  };

  private readonly handleClick = (event: MouseEvent) => {
    if (!this.active) {
      return;
    }

    if (isIgnoredElement(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    if (this.lockedTarget) {
      this.options.onOutsideInteraction?.();
      return;
    }

    const element = findMeaningfulElement(event.target);
    if (!element) {
      return;
    }

    this.lockedTarget = buildTargetSnapshot(element);
    this.render(this.lockedTarget);
    this.options.onTargetSelected?.(this.lockedTarget);
  };

  private readonly handleSubmit = (event: Event) => {
    if (!this.active || isIgnoredElement(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.active) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.options.onEscape?.();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      if (!isIgnoredElement(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  private readonly handleViewportChange = () => {
    if (this.lockedTarget) {
      this.refreshLockedTarget();
      return;
    }

    if (this.hoveredTarget) {
      this.hoveredTarget = buildTargetSnapshot(this.hoveredTarget.element);
      this.render(this.hoveredTarget);
    }
  };

  private render(target: BrowserTaskCaptureTarget) {
    const labelParts = [target.context.tagName];
    if (target.context.role) {
      labelParts.push(target.context.role);
    }
    if (target.context.stableCaptureId) {
      labelParts.push(target.context.stableCaptureId);
    }

    this.overlay.show(target.context.boundingBox, labelParts.join(' • '));
  }
}
