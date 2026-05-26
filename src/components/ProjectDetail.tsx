import { Link, useParams } from "react-router-dom";
import { useNow, type Project } from "../hooks/useProjects";
import { useProjectsContext } from "../contexts/ProjectsContext";
import { getProjectContent, type ProjectContent } from "../data/project-content";
import Terminal from "./Terminal";
import { fallbackSha, timeAgo } from "./Projects";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const { name = "" } = useParams<{ name: string }>();
  const { projects, loading, error, refresh, refreshing, fetchedAt } =
    useProjectsContext();
  const now = useNow();

  const project = projects.find((p) => p.name === name);
  const content = getProjectContent(name);

  const path = `~/projects/${name}`;

  // Still loading and we don't have cached data yet.
  if (loading && !project) {
    return (
      <Terminal path={path} command="cat README.md">
        <div className="pd-loading">loading project…</div>
        <BackPrompt />
      </Terminal>
    );
  }

  // We've finished loading and this project isn't in the list.
  if (!project) {
    return (
      <Terminal path={path} command={`stat ${name}`}>
        <div className="pd-not-found">
          <p className="pd-error-line">
            stat: cannot stat '<span className="pd-arg">{name}</span>': No such
            project
          </p>
          {error && (
            <p className="pd-error-detail">
              (failed to refresh project list: {error})
            </p>
          )}
        </div>
        <BackPrompt />
      </Terminal>
    );
  }

  const sha = (
    project.latestCommit?.sha ?? fallbackSha(project.fullName + project.pushedAt)
  ).slice(0, 7);

  const showStale = Boolean(error) && projects.length > 0;
  const refreshLabel = fetchedAt
    ? showStale
      ? "refresh failed"
      : `last refresh ${timeAgo(new Date(fetchedAt).toISOString(), now)}`
    : null;

  const displayName = content?.displayName ?? project.name;
  const tagline = content?.tagline ?? project.description ?? null;
  const body = content?.body ?? [];
  const images = content?.images ?? [];
  const links = content?.links ?? [];

  return (
    <Terminal
      path={path}
      command="cat README.md"
      onRefresh={refresh}
      refreshing={refreshing}
      status={
        <>
          <span className="status-label">PROJECT</span>
          <span className="status-sep">·</span>
          <span className="pd-status-name">{project.name}</span>
          {project.isPrivate && (
            <>
              <span className="status-sep">·</span>
              <span className="pd-status-private">private</span>
            </>
          )}
          {project.language && (
            <>
              <span className="status-sep">·</span>
              <span>{project.language}</span>
            </>
          )}
          {project.stars > 0 && (
            <>
              <span className="status-sep">·</span>
              <span>★ {project.stars}</span>
            </>
          )}
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
      <Readme
        displayName={displayName}
        tagline={tagline}
        body={body}
        images={images}
        project={project}
        content={content}
      />

      <div className="pd-section-sep" aria-hidden />

      <div className="prompt-line pd-followup">
        <span className="prompt-sigil">$</span>{" "}
        <span className="prompt-cmd">git log -1</span>
      </div>
      <CommitBlock project={project} sha={sha} now={now} />

      {(links.length > 0 || project.homepage) && (
        <>
          <div className="pd-section-sep" aria-hidden />
          <div className="prompt-line pd-followup">
            <span className="prompt-sigil">$</span>{" "}
            <span className="prompt-cmd">cat links.txt</span>
          </div>
          <ul className="pd-links">
            {project.homepage && (
              <li>
                <a href={project.homepage} target="_blank" rel="noreferrer">
                  {project.homepage}
                </a>
                <span className="pd-link-label"> — homepage</span>
              </li>
            )}
            <li>
              <a href={project.url} target="_blank" rel="noreferrer">
                {project.url}
              </a>
              <span className="pd-link-label"> — source on GitHub</span>
            </li>
            {links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.url}
                </a>
                <span className="pd-link-label"> — {l.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="pd-section-sep" aria-hidden />
      <BackPrompt />
    </Terminal>
  );
}

function Readme({
  displayName,
  tagline,
  body,
  images,
  project,
  content,
}: {
  displayName: string;
  tagline: string | null;
  body: string[];
  images: NonNullable<ProjectContent["images"]>;
  project: Project;
  content: ProjectContent | undefined;
}) {
  return (
    <div className="pd-readme">
      <h1 className="pd-title">
        <span className="pd-hash" aria-hidden>
          #{" "}
        </span>
        {displayName}
      </h1>
      {tagline && <p className="pd-tagline">&gt; {tagline}</p>}

      {body.length > 0 ? (
        <div className="pd-body">
          {body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        !content && (
          <div className="pd-body pd-body-hint">
            <p className="pd-hint">
              <span className="pd-comment"># TODO:</span> add content for this
              project in <code>src/data/project-content.ts</code> under the key{" "}
              <code>"{project.name}"</code>.
            </p>
          </div>
        )
      )}

      {images.length > 0 && (
        <div className="pd-gallery">
          {images.map((img) => (
            <figure key={img.src} className="pd-figure">
              <img src={img.src} alt={img.alt} loading="lazy" />
              {img.caption && (
                <figcaption className="pd-caption">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function CommitBlock({
  project,
  sha,
  now,
}: {
  project: Project;
  sha: string;
  now: number;
}) {
  const commitMsg =
    project.latestCommit?.message ?? "(no commit message available)";
  const commitUrl = project.latestCommit?.url ?? project.url;
  return (
    <pre className="pd-commit">
      <span className="pd-commit-line">
        <span className="pd-commit-label">commit</span>{" "}
        <a
          href={commitUrl}
          target="_blank"
          rel="noreferrer"
          className="pd-commit-sha"
        >
          {sha}
        </a>{" "}
        <span className="pd-commit-decorate">(HEAD -&gt; main)</span>
      </span>
      <span className="pd-commit-line pd-commit-date">
        Date: {new Date(project.pushedAt).toUTCString()}{" "}
        <span className="pd-commit-relative">
          ({timeAgo(project.pushedAt, now)})
        </span>
      </span>
      {"\n"}
      <span className="pd-commit-msg">    {commitMsg}</span>
    </pre>
  );
}

function BackPrompt() {
  return (
    <div className="prompt-line pd-back">
      <span className="prompt-sigil">$</span>{" "}
      <Link to="/" className="pd-back-link">
        cd ..
      </Link>
      <span className="prompt-cursor" aria-hidden />
    </div>
  );
}
