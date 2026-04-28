import { z } from 'zod';

const optionalTrimmedString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value: unknown) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, schema.optional());

const boundedNumber = z.number().finite().min(-100_000).max(100_000);

export const uiTaskCaptureBoundingBoxSchema = z.object({
  top: boundedNumber,
  left: boundedNumber,
  width: z.number().finite().min(0).max(100_000),
  height: z.number().finite().min(0).max(100_000),
});

export const uiTaskCaptureViewportSchema = z.object({
  width: z.number().int().min(0).max(20_000),
  height: z.number().int().min(0).max(20_000),
});

export const uiTaskCaptureScrollPositionSchema = z.object({
  x: z.number().int().min(0).max(1_000_000),
  y: z.number().int().min(0).max(1_000_000),
});

export const uiTaskCaptureAncestorSchema = z.object({
  tag_name: z.string().trim().min(1).max(50),
  role: optionalTrimmedString(z.string().max(100)),
  stable_capture_id: optionalTrimmedString(z.string().max(200)),
  text_snippet: optionalTrimmedString(z.string().max(280)),
});

export const uiTaskCaptureElementContextSchema = z.object({
  tag_name: z.string().trim().min(1).max(50),
  role: optionalTrimmedString(z.string().max(100)),
  accessible_name: optionalTrimmedString(z.string().max(280)),
  text_snippet: optionalTrimmedString(z.string().max(500)),
  stable_capture_id: optionalTrimmedString(z.string().max(200)),
  dom_path: z.string().trim().min(1).max(1000),
  class_list: z.array(z.string().trim().min(1).max(100)).max(12).default([]),
  bounding_box: uiTaskCaptureBoundingBoxSchema,
  ancestor_chain: z.array(uiTaskCaptureAncestorSchema).max(8).default([]),
});

export const uiTaskCaptureAppContextSchema = z.object({
  tenant_id: optionalTrimmedString(z.string().max(200)),
  tenant_name: optionalTrimmedString(z.string().max(200)),
  user_id: optionalTrimmedString(z.string().max(200)),
});

export const createUiTaskCaptureSchema = z.object({
  route_path: z.string().trim().min(1).max(500),
  route_query: optionalTrimmedString(z.string().max(2000)),
  current_url: z.string().trim().url().max(2000),
  page_title: optionalTrimmedString(z.string().max(300)),
  viewport: uiTaskCaptureViewportSchema,
  scroll_position: uiTaskCaptureScrollPositionSchema,
  comment: z.string().trim().min(1).max(4000),
  comment_title_override: optionalTrimmedString(z.string().max(140)),
  element_context: uiTaskCaptureElementContextSchema,
  app_context: uiTaskCaptureAppContextSchema.optional(),
});

export const createUiTaskCaptureResponseSchema = z.object({
  capture_id: z.string().trim().min(1),
  issue_number: z.number().int().positive(),
  issue_url: z.string().url(),
  issue_title: z.string().trim().min(1),
  github_issue_id: z.number().int().positive(),
});

export type UiTaskCaptureBoundingBox = z.infer<typeof uiTaskCaptureBoundingBoxSchema>;
export type UiTaskCaptureViewport = z.infer<typeof uiTaskCaptureViewportSchema>;
export type UiTaskCaptureScrollPosition = z.infer<typeof uiTaskCaptureScrollPositionSchema>;
export type UiTaskCaptureAncestor = z.infer<typeof uiTaskCaptureAncestorSchema>;
export type UiTaskCaptureElementContext = z.infer<typeof uiTaskCaptureElementContextSchema>;
export type UiTaskCaptureAppContext = z.infer<typeof uiTaskCaptureAppContextSchema>;
export type CreateUiTaskCaptureInput = z.infer<typeof createUiTaskCaptureSchema>;
export type CreateUiTaskCaptureResult = z.infer<typeof createUiTaskCaptureResponseSchema>;

export type UiTaskCaptureStatus = 'created' | 'failed';

export interface UiTaskCapture extends CreateUiTaskCaptureInput {
  id: string;
  status: UiTaskCaptureStatus;
  created_at: string;
  created_by_user_id: string;
  issue_number?: number;
  issue_url?: string;
  issue_title?: string;
  github_issue_id?: number;
  error_message?: string;
}
