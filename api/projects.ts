import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Server-side proxy for a user's repositories.
 *
 * Returns a curated list of repos sorted by most-recently pushed, with the
 * latest commit message hydrated for the top N. Going through this proxy lets
 * us include private repos (granted the token has access) and avoids exposing
 * the GitHub token to the browser.
 *
 * Required env vars:
 *   GITHUB_TOKEN  — fine-grained PAT with `Metadata: Read` on the desired
 *                   repos, plus `Contents: Read` if you want commit messages.
 *
 * Query params:
 *   ?username=<github-login>     (required)
 *   ?limit=<n>                   (optional, default 12, max 50)
 *   ?include_forks=1             (optional, default false)
 *   ?include_archived=1          (optional, default false)
 *   ?bust=<anything>             (optional, disables caching)
 */

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  default_branch: string;
  topics?: string[];
  homepage: string | null;
};

type CommitResponse = {
  sha: string;
  html_url?: string;
  commit?: { message?: string };
};

type Project = {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  isPrivate: boolean;
  topics: string[];
  homepage: string | null;
  latestCommit: {
    sha: string;
    message: string;
    url: string;
  } | null;
};

const ghHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "portfolio-proxy",
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const username =
    typeof req.query.username === "string" ? req.query.username : null;
  const limit = clampInt(
    typeof req.query.limit === "string" ? req.query.limit : "12",
    1,
    50,
    12
  );
  const includeForks = truthy(req.query.include_forks);
  const includeArchived = truthy(req.query.include_archived);

  if (!username) {
    return res.status(400).json({ error: "Missing ?username=" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res
      .status(500)
      .json({ error: "Server is missing GITHUB_TOKEN env var" });
  }

  try {
    // `affiliation=owner` + token auth returns owned repos including private.
    // 100 is the per_page max; raise to pagination only if you outgrow it.
    const upstream = await fetch(
      `https://api.github.com/user/repos?per_page=100&sort=pushed&direction=desc&affiliation=owner`,
      { headers: ghHeaders(token) }
    );

    if (!upstream.ok) {
      const body = await upstream.text();
      return res
        .status(upstream.status)
        .json({ error: `GitHub API ${upstream.status}`, detail: body });
    }

    const repos: GitHubRepo[] = await upstream.json();

    const filtered = repos
      .filter((r) => r.full_name.startsWith(`${username}/`))
      .filter((r) => (includeForks ? true : !r.fork))
      .filter((r) => (includeArchived ? true : !r.archived))
      .sort(
        (a, b) =>
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      )
      .slice(0, limit);

    const projects: Project[] = await Promise.all(
      filtered.map((repo) => toProject(repo, token))
    );

    const isBust = req.query.bust !== undefined;
    res.setHeader(
      "Cache-Control",
      isBust
        ? "no-store"
        : "public, max-age=0, must-revalidate, s-maxage=300, stale-while-revalidate=600"
    );
    return res.status(200).json(projects);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Upstream fetch failed", detail: (err as Error).message });
  }
}

async function toProject(repo: GitHubRepo, token: string): Promise<Project> {
  const base: Project = {
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
    isPrivate: repo.private,
    topics: repo.topics ?? [],
    homepage: repo.homepage,
    latestCommit: null,
  };

  try {
    const r = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits/${repo.default_branch}`,
      { headers: ghHeaders(token) }
    );
    if (!r.ok) return base;
    const commit = (await r.json()) as CommitResponse;
    if (!commit?.sha) return base;
    return {
      ...base,
      latestCommit: {
        sha: commit.sha,
        message: (commit.commit?.message ?? "").split("\n")[0],
        url:
          commit.html_url ??
          `https://github.com/${repo.full_name}/commit/${commit.sha}`,
      },
    };
  } catch {
    return base;
  }
}

function clampInt(
  raw: string,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function truthy(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}
