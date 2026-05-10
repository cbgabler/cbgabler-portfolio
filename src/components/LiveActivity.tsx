import { useEffect, useRef, useState } from "react";
import "./LiveActivity.css";

type Props = {
  username: string;
  /** Polling interval in ms. GitHub public events are cached ~60s server-side. */
  pollMs?: number;
};

type Activity = {
  id: string;
  repo: string;
  message: string;
  url: string;
  createdAt: string;
};

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: { message: string; sha: string }[];
    pull_request?: { title: string; html_url: string };
    issue?: { title: string; html_url: string };
    ref?: string;
    ref_type?: string;
    action?: string;
  };
};

export default function LiveActivity({ username, pollMs = 90_000 }: Props) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      try {
        const res = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=10`,
          { headers: { Accept: "application/vnd.github+json" } }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const events: GitHubEvent[] = await res.json();
        const next = events.map(toActivity).find(Boolean) as Activity | undefined;
        if (cancelled || !next) return;

        if (lastIdRef.current && lastIdRef.current !== next.id) {
          setPulsing(true);
          setTimeout(() => !cancelled && setPulsing(false), 2000);
        }
        lastIdRef.current = next.id;
        setActivity(next);
        setError(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchActivity();
    const id = setInterval(fetchActivity, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [username, pollMs]);

  return (
    <div className={`activity-card ${pulsing ? "is-pulsing" : ""}`}>
      <div className="activity-header">
        <span className="dot" />
        <span className="activity-title">Latest Activity</span>
      </div>

      {loading && !activity ? (
        <Skeleton />
      ) : error ? (
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
            <span>{timeAgo(activity.createdAt)}</span>
          </div>
        </a>
      ) : null}
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

function toActivity(e: GitHubEvent): Activity | null {
  const repo = e.repo.name;
  const base: Omit<Activity, "message" | "url"> = {
    id: e.id,
    repo,
    createdAt: e.created_at,
  };
  switch (e.type) {
    case "PushEvent": {
      const commit = e.payload.commits?.[0];
      if (!commit) return null;
      return {
        ...base,
        message: commit.message.split("\n")[0],
        url: `https://github.com/${repo}/commit/${commit.sha}`,
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
