import { Link, Route, Routes } from "react-router-dom";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import "./App.css";

const GITHUB_USERNAME = "cbgabler";
const PROJECTS_ENDPOINT = import.meta.env.PROD ? "/api/projects" : undefined;

export default function App() {
  return (
    <div className="page">
      <header className="nav">
        <Link to="/" className="brand">
          CG
        </Link>
        <nav>
          <a href="/#about">About</a>
          <Link to="/#projects">Projects</Link>
          <a href="/#contact">Contact</a>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/projects/:name"
            element={
              <ProjectDetailRoute
                username={GITHUB_USERNAME}
                endpoint={PROJECTS_ENDPOINT}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Carson Gabler</span>
      </footer>
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <h1>Hi, I'm Carson.</h1>
        <p></p>
      </section>

      <section id="about" className="section">
        <h2>About</h2>
        <p></p>
      </section>

      <section id="projects" className="section">
        <Projects
          username={GITHUB_USERNAME}
          endpoint={PROJECTS_ENDPOINT}
          limit={12}
        />
      </section>

      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>
          Reach me at <a href="mailto:you@example.com">you@example.com</a>.
        </p>
      </section>
    </>
  );
}

function ProjectDetailRoute({
  username,
  endpoint,
}: {
  username: string;
  endpoint?: string;
}) {
  return (
    <section className="section project-detail-section">
      <ProjectDetail username={username} endpoint={endpoint} />
    </section>
  );
}

function NotFound() {
  return (
    <section className="section">
      <h2>404</h2>
      <p>
        Page not found. <Link to="/">Go home</Link>.
      </p>
    </section>
  );
}
