import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Server-side proxy for GitHub events.
 *
 * Why this exists:
 *   - We use the authenticated `/users/{username}/events` endpoint so private
 *     repo activity shows up.
 *   - Authenticated requests strip the `commits` array out of PushEvent
 *     payloads (a GitHub quirk, especially with fine-grained tokens), so we
 *     re-hydrate it by fetching the head commit directly. That requires
 *     `Contents: Read` on each repo whose commits you want to show.
 *
 * Required env vars (set in Vercel dashboard):
 *   GITHUB_TOKEN  — fine-grained PAT with `Metadata: Read` (auto) and
 *                   `Contents: Read` on the desired repos. Or a classic
 *                   PAT with the `repo` scope.
 *
 * Query params:
 *   ?username=<github-login>   (required)
 *   ?per_page=<n>              (optional, default 10, max 100)
 *   ?bust=<anything>           (optional, skips CDN cache and tells the
 *                               browser/CDN not to cache the response either)
 */

type GitHubEvent = {
  type: string;
  repo: { name: string };
  payload: {
    commits?: { sha: string; message: string }[];
    head?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

type CommitResponse = {
  sha: string;
  commit?: { message?: string };
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
  const perPage = clampInt(
    typeof req.query.per_page === "string" ? req.query.per_page : "10",
    1,
    100,
    10
  );

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
    const upstream = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/events?per_page=${perPage}`,
      { headers: ghHeaders(token) }
    );

    if (!upstream.ok) {
      const body = await upstream.text();
      return res
        .status(upstream.status)
        .json({ error: `GitHub API ${upstream.status}`, detail: body });
    }

    const events: GitHubEvent[] = await upstream.json();
    const enriched = await Promise.all(
      events.map((e) => hydratePushEvent(e, token))
    );

    const isBust = req.query.bust !== undefined;
    res.setHeader(
      "Cache-Control",
      isBust
        ? "no-store"
        : "public, max-age=0, must-revalidate, s-maxage=30, stale-while-revalidate=30"
    );
    return res.status(200).json(enriched);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Upstream fetch failed", detail: (err as Error).message });
  }
}

/**
 * If a PushEvent's commits array is empty (which it usually is for authed
 * requests), look up the head commit and inject it so the client's existing
 * `payload.commits[0]` logic just works.
 */
async function hydratePushEvent(
  e: GitHubEvent,
  token: string
): Promise<GitHubEvent> {
  if (e.type !== "PushEvent") return e;
  if (e.payload.commits && e.payload.commits.length > 0) return e;
  const head = e.payload.head;
  if (!head) return e;

  try {
    const r = await fetch(
      `https://api.github.com/repos/${e.repo.name}/commits/${head}`,
      { headers: ghHeaders(token) }
    );
    if (!r.ok) return e;
    const commit = (await r.json()) as CommitResponse;
    return {
      ...e,
      payload: {
        ...e.payload,
        commits: [
          {
            sha: commit.sha,
            message: commit.commit?.message ?? "",
          },
        ],
      },
    };
  } catch {
    return e;
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
