import { Link } from "react-router-dom";
import { useNow, type Project } from "../hooks/useProjects";
import { useProjectsContext } from "../contexts/ProjectsContext";
import Terminal from "./Terminal";
import "./Projects.css";

type Props = {
  /** Cap the number shown. Doesn't refetch — purely a display cap. */
  limit?: number;
};

export default function Projects({ limit }: Props = {}) {
  const { projects: all, loading, error, refreshing, fetchedAt, refresh } =
    useProjectsContext();
  const projects = typeof limit === "number" ? all.slice(0, limit) : all;
  const now = useNow();

  const showStale = Boolean(error) && projects.length > 0;
  const refreshLabel = fetchedAt
    ? showStale
      ? "refresh failed"
      : `last refresh ${timeAgo(new Date(fetchedAt).toISOString(), now)}`
    : null;

  return (
    <Terminal
      path="~/projects"
      command="git log --graph --decorate"
      onRefresh={refresh}
      refreshing={refreshing}
      status={
        <>
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
        </>
      }
    >
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
    </Terminal>
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
      <Link to={`/projects/${project.name}`} className="entry-link">
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
      </Link>

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

// ----------------------------------------------------------------
// Helpers (also re-exported for ProjectDetail's use)
// ----------------------------------------------------------------

export function timeAgo(iso: string, now: number = Date.now()): string {
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

export function fallbackSha(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  }
  const hex = Math.abs(hash).toString(16);
  return (hex + "0000000").slice(0, 7);
}

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

export function languageColor(language: string): string {
  return LANG_COLORS[language] ?? "#9eff8a";
}
