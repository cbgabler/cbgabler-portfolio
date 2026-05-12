import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Project = {
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

type CachedProjects = {
  projects: Project[];
  fetchedAt: number;
};

const CACHE_VERSION = 2;
const cacheKey = (username: string) =>
  `projects:v${CACHE_VERSION}:${username}`;

function readCache(username: string): CachedProjects | null {
  try {
    const raw = localStorage.getItem(cacheKey(username));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedProjects;
    if (!Array.isArray(parsed?.projects)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(username: string, value: CachedProjects): void {
  try {
    localStorage.setItem(cacheKey(username), JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export type UseProjectsOptions = {
  username: string;
  /** Server-side proxy. If absent, falls back to GitHub's public API. */
  endpoint?: string;
  limit?: number;
  /** Polling interval in ms. Defaults to 10 minutes. */
  pollMs?: number;
};

export type UseProjectsResult = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchedAt: number | null;
  refresh: () => Promise<void>;
};

export function useProjects({
  username,
  endpoint,
  limit = 12,
  pollMs = 10 * 60_000,
}: UseProjectsOptions): UseProjectsResult {
  const cached = useMemo(() => readCache(username), [username]);
  const [projects, setProjects] = useState<Project[]>(cached?.projects ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(
    cached?.fetchedAt ?? null
  );
  const cancelledRef = useRef(false);

  const fetchProjects = useCallback(
    async ({ bust = false }: { bust?: boolean } = {}) => {
      try {
        let next: Project[];
        if (endpoint) {
          const params = new URLSearchParams({
            username,
            limit: String(limit),
          });
          if (bust) params.set("bust", String(Date.now()));
          const res = await fetch(`${endpoint}?${params.toString()}`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          });
          if (!res.ok) throw new Error(`Projects API ${res.status}`);
          next = (await res.json()) as Project[];
        } else {
          // Dev fallback: GitHub's public API (no token, no private repos).
          const url = `https://api.github.com/users/${encodeURIComponent(
            username
          )}/repos?per_page=100&sort=pushed&direction=desc&type=owner${
            bust ? `&_=${Date.now()}` : ""
          }`;
          const res = await fetch(url, {
            cache: "no-store",
            headers: { Accept: "application/vnd.github+json" },
          });
          if (!res.ok) throw new Error(`GitHub API ${res.status}`);
          const repos = (await res.json()) as Array<{
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
            topics?: string[];
            homepage: string | null;
          }>;
          next = repos
            .filter((r) => !r.fork && !r.archived)
            .slice(0, limit)
            .map((r) => ({
              name: r.name,
              fullName: r.full_name,
              url: r.html_url,
              description: r.description,
              language: r.language,
              stars: r.stargazers_count,
              pushedAt: r.pushed_at,
              isPrivate: r.private,
              topics: r.topics ?? [],
              homepage: r.homepage,
              latestCommit: null,
            }));
        }

        if (cancelledRef.current) return;

        next.sort(
          (a, b) =>
            new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
        );

        const fetchedAtMs = Date.now();
        setProjects(next);
        setFetchedAt(fetchedAtMs);
        setError(null);
        writeCache(username, { projects: next, fetchedAt: fetchedAtMs });
      } catch (e) {
        if (!cancelledRef.current) setError((e as Error).message);
      } finally {
        if (!cancelledRef.current) setLoading(false);
      }
    },
    [username, endpoint, limit]
  );

  useEffect(() => {
    cancelledRef.current = false;
    fetchProjects();
    const id = setInterval(fetchProjects, pollMs);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [fetchProjects, pollMs]);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchProjects({ bust: true });
    } finally {
      setRefreshing(false);
    }
  }, [fetchProjects, refreshing]);

  return { projects, loading, error, refreshing, fetchedAt, refresh };
}

/** Useful for components that want a re-rendering "now" value for timeAgo. */
export function useNow(intervalMs: number = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
