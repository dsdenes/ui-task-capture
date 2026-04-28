import type { BrowserTaskCapturePayload } from './task-capture.js';

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
