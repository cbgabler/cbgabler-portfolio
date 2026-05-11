import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./LiveActivity.css";

type Props = {
  username: string;
  /** Polling interval in ms. GitHub public events are cached ~60s server-side. */
  pollMs?: number;
  endpoint?: string;
};

type Activity = {
  id: string;
  repo: string;
  message: string;
  url: string;
  createdAt: string;
};

type CachedActivity = {
  activity: Activity;
  fetchedAt: number;
};

const CACHE_VERSION = 1;
const cacheKey = (username: string) =>
  `live-activity:v${CACHE_VERSION}:${username}`;

function readCache(username: string): CachedActivity | null {
  try {
    const raw = localStorage.getItem(cacheKey(username));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedActivity;
    if (!parsed?.activity?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(username: string, value: CachedActivity): void {
  try {
    localStorage.setItem(cacheKey(username), JSON.stringify(value));
  } catch {
    // Quota exceeded / private mode — silently ignore.
  }
}

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: { message: string; sha: string }[];
    head?: string;
    size?: number;
    pull_request?: { title: string; html_url: string };
    issue?: { title: string; html_url: string };
    ref?: string;
    ref_type?: string;
    action?: string;
  };
};

export default function LiveActivity({
  username,
  pollMs = 90_000,
  endpoint,
}: Props) {
  const cached = useMemo(() => readCache(username), [username]);
  const [activity, setActivity] = useState<Activity | null>(
    cached?.activity ?? null
  );
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(
    cached?.fetchedAt ?? null
  );
  const [now, setNow] = useState(() => Date.now());
  const lastIdRef = useRef<string | null>(cached?.activity.id ?? null);
  const cancelledRef = useRef(false);

  const fetchActivity = useCallback(
    async ({ bust = false }: { bust?: boolean } = {}) => {
      try {
        const params = new URLSearchParams({
          username,
          per_page: "10",
        });
        if (bust) params.set("bust", String(Date.now()));

        const url = endpoint
          ? `${endpoint}?${params.toString()}`
          : `https://api.github.com/users/${username}/events/public?per_page=10${
              bust ? `&_=${Date.now()}` : ""
            }`;

        const res = await fetch(url, {
          cache: "no-store",
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const events: GitHubEvent[] = await res.json();

        // Walk events in order; hydrate the first PushEvent whose commits
        // are empty (only happens when not going through our proxy, e.g.
        // `npm run dev`). For public repos this works unauthenticated.
        let next: Activity | undefined;
        for (const event of events) {
          let working = event;
          if (
            event.type === "PushEvent" &&
            !event.payload.commits?.length &&
            event.payload.head
          ) {
            working = await hydrateClientSide(event);
          }
          const candidate = toActivity(working);
          if (candidate) {
            next = candidate;
            break;
          }
        }
        if (cancelledRef.current) return;

        const fetchedAtMs = Date.now();
        setFetchedAt(fetchedAtMs);
        setError(null);
        if (!next) return;

        if (lastIdRef.current && lastIdRef.current !== next.id) {
          setPulsing(true);
          setTimeout(
            () => !cancelledRef.current && setPulsing(false),
            2000
          );
        }
        lastIdRef.current = next.id;
        setActivity(next);
        writeCache(username, { activity: next, fetchedAt: fetchedAtMs });
      } catch (e) {
        // Keep showing cached activity if we have it; just surface the
        // error in the footer instead of replacing the whole card.
        if (!cancelledRef.current) setError((e as Error).message);
      } finally {
        if (!cancelledRef.current) setLoading(false);
      }
    },
    [username, endpoint]
  );

  useEffect(() => {
    cancelledRef.current = false;
    fetchActivity();
    const id = setInterval(fetchActivity, pollMs);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [fetchActivity, pollMs]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchActivity({ bust: true });
    setRefreshing(false);
  };

  return (
    <div className={`activity-card ${pulsing ? "is-pulsing" : ""}`}>
      <div className="activity-header">
        <span className="dot" />
        <span className="activity-title">Latest Activity</span>
        <button
          type="button"
          className={`refresh-btn ${refreshing ? "is-spinning" : ""}`}
          onClick={onRefresh}
          aria-label="Refresh"
          title="Refresh now"
        >
          ↻
        </button>
      </div>

      {loading && !activity ? (
        <Skeleton />
      ) : !activity && error ? (
        <div className="activity-error">Couldn't load activity ({error}).</div>
      ) : activity ? (
        <a
          key={activity.id}
          href={activity.url}
          target="_blank"
          rel="noreferrer"
          className="activity-body fade-in"
        >
          <div className="activity-row">
            <span className="emoji">📦</span>
            <span className="repo">{activity.repo}</span>
          </div>
          <div className="activity-row message">
            <span className="emoji">💬</span>
            <span>"{activity.message}"</span>
          </div>
          <div className="activity-row meta">
            <span className="emoji">⏱</span>
            <span>{timeAgo(activity.createdAt, now)}</span>
          </div>
        </a>
      ) : null}

      {fetchedAt && (
        <div
          className={`activity-footer ${
            error && activity ? "is-stale" : ""
          }`}
        >
          {error && activity
            ? `showing cached · refresh failed (${error})`
            : `fetched ${timeAgo(new Date(fetchedAt).toISOString(), now)}`}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="activity-body" aria-hidden>
      <div className="skeleton skeleton-line w-60" />
      <div className="skeleton skeleton-line w-90" />
      <div className="skeleton skeleton-line w-40" />
    </div>
  );
}

async function hydrateClientSide(e: GitHubEvent): Promise<GitHubEvent> {
  if (!e.payload.head) return e;
  try {
    const r = await fetch(
      `https://api.github.com/repos/${e.repo.name}/commits/${e.payload.head}`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!r.ok) return e;
    const commit = (await r.json()) as {
      sha: string;
      commit?: { message?: string };
    };
    return {
      ...e,
      payload: {
        ...e.payload,
        commits: [{ sha: commit.sha, message: commit.commit?.message ?? "" }],
      },
    };
  } catch {
    return e;
  }
}

function toActivity(e: GitHubEvent): Activity | null {
  const repo = e.repo.name;
  const base: Omit<Activity, "message" | "url"> = {
    id: e.id,
    repo,
    createdAt: e.created_at,
  };
  switch (e.type) {
    case "PushEvent": {
      const branch = (e.payload.ref ?? "").replace(/^refs\/heads\//, "");
      const commit = e.payload.commits?.[0];
      if (commit) {
        return {
          ...base,
          message: commit.message.split("\n")[0],
          url: `https://github.com/${repo}/commit/${commit.sha}`,
        };
      }
      const head = e.payload.head;
      if (!head) return null;
      const count = e.payload.size ?? 1;
      return {
        ...base,
        message: `pushed ${count} commit${count === 1 ? "" : "s"} to ${
          branch || "main"
        }`,
        url: `https://github.com/${repo}/commit/${head}`,
      };
    }
    case "PullRequestEvent":
      if (!e.payload.pull_request) return null;
      return {
        ...base,
        message: `${e.payload.action} PR: ${e.payload.pull_request.title}`,
        url: e.payload.pull_request.html_url,
      };
    case "IssuesEvent":
      if (!e.payload.issue) return null;
      return {
        ...base,
        message: `${e.payload.action} issue: ${e.payload.issue.title}`,
        url: e.payload.issue.html_url,
      };
    case "CreateEvent":
      return {
        ...base,
        message: `created ${e.payload.ref_type}${
          e.payload.ref ? ` ${e.payload.ref}` : ""
        }`,
        url: `https://github.com/${repo}`,
      };
    case "WatchEvent":
      return {
        ...base,
        message: `starred ${repo}`,
        url: `https://github.com/${repo}`,
      };
    case "ForkEvent":
      return {
        ...base,
        message: `forked ${repo}`,
        url: `https://github.com/${repo}`,
      };
    default:
      return null;
  }
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
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
