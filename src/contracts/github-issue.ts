import { z } from 'zod';
import type { BrowserTaskCapturePayload } from './task-capture.js';

export const githubIssueResponseSchema = z.object({
  id: z.number().int().positive(),
  number: z.number().int().positive(),
  html_url: z.string().url(),
  title: z.string().min(1),
});

export interface GitHubIssueDraft {
  title: string;
  body: string;
  labels?: string[];
}

export interface GitHubIssueResult {
  id: number;
  number: number;
  url: string;
  title: string;
}

export interface GitHubIssueClient {
  createIssue(draft: GitHubIssueDraft): Promise<GitHubIssueResult>;
}

export interface IssueBodyContext {
  capture: BrowserTaskCapturePayload;
  submittedBy: {
    userId: string;
    email?: string;
  };
}
