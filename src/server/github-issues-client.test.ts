import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubIssuesClient } from './github-issues-client.js';

describe('GitHubIssuesClient', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('creates an issue through the GitHub REST API', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1001,
        number: 42,
        html_url: 'https://github.com/dsdenes/aijourney/issues/42',
        title: 'Save button',
      }),
    }) as typeof globalThis.fetch;

    const client = new GitHubIssuesClient({
      token: 'test-token',
      owner: 'dsdenes',
      repo: 'aijourney',
    });

    const result = await client.createIssue({
      title: 'Save button',
      body: 'Body',
      labels: ['ui-task-capture'],
    });

    expect(result).toEqual({
      id: 1001,
      number: 42,
      url: 'https://github.com/dsdenes/aijourney/issues/42',
      title: 'Save button',
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/dsdenes/aijourney/issues',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('surfaces GitHub API errors with the response message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Bad credentials' }),
    }) as typeof globalThis.fetch;

    const client = new GitHubIssuesClient({
      token: 'test-token',
      owner: 'dsdenes',
      repo: 'aijourney',
    });

    await expect(
      client.createIssue({
        title: 'Save button',
        body: 'Body',
      }),
    ).rejects.toThrow('Bad credentials');
  });
});
