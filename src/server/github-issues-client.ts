import {
  githubIssueResponseSchema,
  type GitHubIssueClient,
  type GitHubIssueDraft,
  type GitHubIssueResult,
} from '../contracts/github-issue.js';

export interface GitHubIssuesClientOptions {
  token: string;
  owner: string;
  repo: string;
  apiBaseUrl?: string;
}

function describeError(status: number, payload: unknown): string {
  if (typeof payload === 'object' && payload !== null) {
    const record = payload as Record<string, unknown>;
    const baseMessage =
      typeof record.message === 'string' ? record.message : `GitHub API error ${status}`;
    const errors = Array.isArray(record.errors)
      ? record.errors
          .map((error) => (typeof error === 'string' ? error : JSON.stringify(error)))
          .join(', ')
      : undefined;

    return errors ? `${baseMessage}: ${errors}` : baseMessage;
  }

  return `GitHub API error ${status}`;
}

export class GitHubIssuesClient implements GitHubIssueClient {
  private readonly token: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly apiBaseUrl: string;

  constructor(options: GitHubIssuesClientOptions) {
    this.token = options.token;
    this.owner = options.owner;
    this.repo = options.repo;
    this.apiBaseUrl = options.apiBaseUrl ?? 'https://api.github.com';
  }

  async createIssue(draft: GitHubIssueDraft): Promise<GitHubIssueResult> {
    const response = await fetch(`${this.apiBaseUrl}/repos/${this.owner}/${this.repo}/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aijourney-ui-task-capture',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: draft.title,
        body: draft.body,
        labels: draft.labels,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(describeError(response.status, payload));
    }

    const data = githubIssueResponseSchema.parse(payload);
    return {
      id: data.id,
      number: data.number,
      url: data.html_url,
      title: data.title,
    };
  }
}
