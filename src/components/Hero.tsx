import { useNow } from "../hooks/useProjects";
import { useProjectsContext } from "../contexts/ProjectsContext";
import { SITE } from "../data/site-config";
import { timeAgo } from "./Projects";
import "./Hero.css";

export default function Hero() {
  const { projects } = useProjectsContext();
  const now = useNow();
  const latest = projects[0];

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-prompt">
        <span className="hero-sigil">$</span>{" "}
        <span className="hero-cmd">whoami</span>
      </div>

      <h1 className="hero-name" id="hero-heading">
        {SITE.name}
      </h1>

      <p className="hero-title">
        <span className="hero-arrow">&gt;</span> {SITE.title}
        <span className="hero-cursor" aria-hidden />
      </p>

      <p className="hero-tagline">{SITE.tagline}</p>

      {(SITE.currently || latest) && (
        <div className="hero-meta">
          {latest ? (
            <div className="hero-meta-line">
              <span className="hero-dot" aria-hidden />
              <span className="hero-meta-label">currently</span>
              <span className="hero-meta-sep">·</span>
              <span>
                shipping commits to{" "}
                <a href={`/projects/${latest.name}`} className="hero-meta-link">
                  {latest.name}
                </a>
              </span>
              <span className="hero-meta-time">
                ({timeAgo(latest.pushedAt, now)})
              </span>
            </div>
          ) : SITE.currently ? (
            <div className="hero-meta-line">
              <span className="hero-dot" aria-hidden />
              <span className="hero-meta-label">currently</span>
              <span className="hero-meta-sep">·</span>
              <span>{SITE.currently}</span>
            </div>
          ) : null}
        </div>
      )}

      <div className="hero-actions">
        {SITE.social.email && (
          <a
            href={`mailto:${SITE.social.email}`}
            className="hero-action"
          >
            <span className="ha-bracket">[</span>
            email
            <span className="ha-bracket">]</span>
          </a>
        )}
        {SITE.social.githubUrl && (
          <a
            href={SITE.social.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="hero-action"
          >
            <span className="ha-bracket">[</span>
            github
            <span className="ha-bracket">]</span>
          </a>
        )}
        {SITE.social.linkedinUrl && (
          <a
            href={SITE.social.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="hero-action"
          >
            <span className="ha-bracket">[</span>
            linkedin
            <span className="ha-bracket">]</span>
          </a>
        )}
        {SITE.social.resumeUrl && (
          <a
            href={SITE.social.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="hero-action"
          >
            <span className="ha-bracket">[</span>
            resume
            <span className="ha-bracket">]</span>
          </a>
        )}
      </div>
    </section>
  );
}
