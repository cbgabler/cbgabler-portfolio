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

  const showStale = Boolean(error) && projects.length > 0;
  const refreshLabel = fetchedAt
    ? showStale
      ? "refresh failed"
      : `last refresh ${timeAgo(new Date(fetchedAt).toISOString(), now)}`
    : null;

  return (
    <div className="terminal" role="region" aria-label="Projects">
      <div className="terminal-titlebar">
        <span className="tl-dots" aria-hidden>
          <span className="tl-dot tl-red" />
          <span className="tl-dot tl-yellow" />
          <span className="tl-dot tl-green" />
        </span>
        <h2 className="tl-title">
          carson@portfolio: <span className="tl-path">~/projects</span>
        </h2>
        <span className="tl-spacer" aria-hidden />
      </div>

      <div className="terminal-statusbar">
        <span className="status-label">PROJECTS</span>
        <span className="status-sep">·</span>
        <span>
          {projects.length || "—"} repo{projects.length === 1 ? "" : "s"}
        </span>
        {refreshLabel && (
          <>
            <span className="status-sep">·</span>
            <span className={showStale ? "status-stale" : ""}>
              {refreshLabel}
            </span>
          </>
        )}
        <span className="status-spacer" aria-hidden />
        <button
          type="button"
          className={`status-refresh ${refreshing ? "is-spinning" : ""}`}
          onClick={onRefresh}
          aria-label="Refresh projects"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <div className="terminal-body">
        <div className="prompt-line">
          <span className="prompt-sigil">$</span>{" "}
          <span className="prompt-cmd">git log --graph --decorate</span>
          <span className="prompt-cursor" aria-hidden />
        </div>

        {loading && projects.length === 0 ? (
          <GitLogSkeleton />
        ) : !projects.length && error ? (
          <div className="git-log-error">
            ! couldn't load projects ({error})
          </div>
        ) : (
          <ol className="git-log">
            {projects.map((p, i) => (
              <GitLogEntry
                key={p.fullName}
                project={p}
                isLast={i === projects.length - 1}
                now={now}
              />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function GitLogEntry({
  project,
  isLast,
  now,
}: {
  project: Project;
  isLast: boolean;
  now: number;
}) {
  const sha = (
    project.latestCommit?.sha ?? fallbackSha(project.fullName + project.pushedAt)
  ).slice(0, 7);

  return (
    <li className="entry">
      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className="entry-link"
      >
        <div className="row row-head">
          <span className="g-col" aria-hidden>
            *
          </span>
          <span className="sha-col">{sha}</span>
          <span className="content-col content-head">
            <span className="repo-name">{project.name}</span>
            {project.isPrivate && (
              <span className="private-pill">[private]</span>
            )}
          </span>
          <span
            className="ts-col"
            title={new Date(project.pushedAt).toLocaleString()}
          >
            {timeAgo(project.pushedAt, now)}
          </span>
        </div>

        {project.description && (
          <div className="row row-sub">
            <span className="g-col" aria-hidden>
              |
            </span>
            <span className="sha-col" aria-hidden />
            <span className="content-col description">
              {project.description}
            </span>
          </div>
        )}

        {project.latestCommit && (
          <div className="row row-sub">
            <span className="g-col" aria-hidden>
              |
            </span>
            <span className="sha-col" aria-hidden />
            <span className="content-col commit-msg">
              <span className="commit-arrow" aria-hidden>
                →
              </span>
              {project.latestCommit.message || "(no commit message)"}
            </span>
          </div>
        )}

        {(project.language || project.stars > 0) && (
          <div className="row row-sub">
            <span className="g-col" aria-hidden>
              |
            </span>
            <span className="sha-col" aria-hidden />
            <span className="content-col meta">
              {project.language && (
                <span className="meta-item">
                  <span
                    className="lang-dot"
                    style={{ background: languageColor(project.language) }}
                  />
                  {project.language}
                </span>
              )}
              {project.stars > 0 && (
                <span className="meta-item">★ {project.stars}</span>
              )}
            </span>
          </div>
        )}
      </a>

      {!isLast && (
        <div className="row row-connector" aria-hidden>
          <span className="g-col">|</span>
        </div>
      )}
    </li>
  );
}

function GitLogSkeleton() {
  return (
    <ol className="git-log" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="entry entry-skel">
          <div className="row row-head">
            <span className="g-col">*</span>
            <span className="sha-col">
              <span className="skel skel-line" />
            </span>
            <span className="content-col">
              <span className="skel skel-line w-50" />
            </span>
            <span className="ts-col">
              <span className="skel skel-line w-80" />
            </span>
          </div>
          <div className="row row-sub">
            <span className="g-col">|</span>
            <span className="sha-col" />
            <span className="content-col">
              <span className="skel skel-line w-90" />
            </span>
          </div>
          <div className="row row-sub">
            <span className="g-col">|</span>
            <span className="sha-col" />
            <span className="content-col">
              <span className="skel skel-line w-70" />
            </span>
          </div>
          {i < 3 && (
            <div className="row row-connector">
              <span className="g-col">|</span>
            </div>
          )}
        </li>
      ))}
    </ol>
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

// Stable 7-char hex pseudo-SHA, used when the commit isn't available
// (e.g. in dev mode hitting GitHub directly without commit hydration).
function fallbackSha(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  }
  const hex = Math.abs(hash).toString(16);
  return (hex + "0000000").slice(0, 7);
}

// Subset of GitHub linguist colors. Falls back to phosphor green.
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
  return LANG_COLORS[language] ?? "#9eff8a";
}
