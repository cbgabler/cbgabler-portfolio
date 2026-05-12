import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Projects.css";

type Props = {
  username: string;
  /** When set, fetch through this server-side proxy (so private repos work). */
  endpoint?: string;
  /** Max repos to show. */
  limit?: number;
  /** Polling interval in ms. Defaults to 10 minutes. */
  pollMs?: number;
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

type CachedProjects = {
  projects: Project[];
  fetchedAt: number;
};

const CACHE_VERSION = 1;
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

export default function Projects({
  username,
  endpoint,
  limit = 12,
  pollMs = 10 * 60_000,
}: Props) {
  const cached = useMemo(() => readCache(username), [username]);
  const [projects, setProjects] = useState<Project[]>(cached?.projects ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(
    cached?.fetchedAt ?? null
  );
  const [now, setNow] = useState(() => Date.now());
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
          // Dev fallback: hit GitHub directly (public repos only, no token).
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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchProjects({ bust: true });
    setRefreshing(false);
  };

  return (
    <div className="projects">
      <div className="projects-header">
        <h2>Projects</h2>
        <div className="projects-meta">
          {fetchedAt && (
            <span
              className={`projects-fetched ${
                error && projects.length ? "is-stale" : ""
              }`}
            >
              {error && projects.length
                ? `cached · refresh failed`
                : `updated ${timeAgo(new Date(fetchedAt).toISOString(), now)}`}
            </span>
          )}
          <button
            type="button"
            className={`refresh-btn ${refreshing ? "is-spinning" : ""}`}
            onClick={onRefresh}
            aria-label="Refresh projects"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <ProjectsSkeleton />
      ) : !projects.length && error ? (
        <div className="projects-error">
          Couldn't load projects ({error}).
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <a
              key={p.fullName}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="project-card"
            >
              <div className="project-card-top">
                <h3 className="project-name">
                  {p.name}
                  {p.isPrivate && (
                    <span className="project-badge" title="Private repo">
                      private
                    </span>
                  )}
                </h3>
                <span
                  className="project-updated"
                  title={new Date(p.pushedAt).toLocaleString()}
                >
                  {timeAgo(p.pushedAt, now)}
                </span>
              </div>

              {p.description && (
                <p className="project-description">{p.description}</p>
              )}

              {p.latestCommit && (
                <div className="project-commit" title="Latest commit">
                  <span className="emoji">💬</span>
                  <span className="project-commit-msg">
                    {p.latestCommit.message}
                  </span>
                </div>
              )}

              <div className="project-footer">
                {p.language && (
                  <span className="project-tag">
                    <span
                      className="project-lang-dot"
                      style={{ background: languageColor(p.language) }}
                    />
                    {p.language}
                  </span>
                )}
                {p.stars > 0 && (
                  <span className="project-tag">★ {p.stars}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="projects-grid" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="project-card project-card-skel">
          <div className="skeleton skel-line w-60" />
          <div className="skeleton skel-line w-90" />
          <div className="skeleton skel-line w-40" />
        </div>
      ))}
    </div>
  );
}

function timeAgo(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const secs = Math.round(diff / 1000);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

// A tiny subset of GitHub's linguist colors; falls back to accent.
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4F5D95",
  SQL: "#e38c00",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

function languageColor(language: string): string {
  return LANG_COLORS[language] ?? "var(--accent, #7aa2ff)";
}
