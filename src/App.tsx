import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import SectionHeading from "./components/SectionHeading";
import { NAV_LINKS, SITE } from "./data/site-config";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import "./App.css";

const PROJECTS_ENDPOINT = import.meta.env.PROD ? "/api/projects" : undefined;

export default function App() {
  return (
    <ProjectsProvider username={SITE.username} endpoint={PROJECTS_ENDPOINT}>
      <ScrollToHashOrTop />
      <div className="page">
        <SiteHeader />
        <main className="page-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:name" element={<ProjectDetailRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </ProjectsProvider>
  );
}

function SiteHeader() {
  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-prompt">~/</span>
        <span className="brand-initials">{SITE.initials.toLowerCase()}</span>
        <span className="brand-cursor" aria-hidden />
      </Link>
      <nav className="nav-links" aria-label="Primary">
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="footer">
      <span className="footer-prompt">$</span>{" "}
      <span className="footer-text">
        echo &quot;© {new Date().getFullYear()} {SITE.name}&quot;
      </span>
    </footer>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <About />
      <section id="projects" className="section">
        <SectionHeading hash="projects" command="ls -lt ~/projects">
          projects
        </SectionHeading>
        <Projects limit={12} />
      </section>
      <Skills />
      <Contact />
    </>
  );
}

function ProjectDetailRoute() {
  return (
    <section className="section project-detail-section">
      <ProjectDetail />
    </section>
  );
}

function NotFound() {
  return (
    <section className="section">
      <h2 className="section-heading">
        <span className="section-prompt">$</span>{" "}
        <span className="section-cmd">cd /404</span>
      </h2>
      <p>
        That path doesn&apos;t exist. <Link to="/">cd ~</Link>
      </p>
    </section>
  );
}

/**
 * Two responsibilities:
 *   - On a route change without a hash, scroll to top.
 *   - On a route change with a hash (or initial load), scroll to that anchor
 *     once it exists in the DOM. Lets in-page links work cross-route.
 */
function ScrollToHashOrTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    // Allow the route's content to mount before we measure.
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

