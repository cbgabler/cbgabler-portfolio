import LiveActivity from "./components/LiveActivity";
import Projects from "./components/Projects";
import "./App.css";

export default function App() {
  return (
    <div className="page">
      <header className="nav">
        <span className="brand">CG</span>
        <nav>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Hi, I'm Carson.</h1>
          <p>
          </p>
        </section>

        <section className="section">
          <LiveActivity
            username="cbgabler"
            endpoint={import.meta.env.PROD ? "/api/github-events" : undefined}
            pollMs={import.meta.env.PROD ? 90_000 : 600_000}
          />
        </section>

        <section id="about" className="section">
          <h2>About</h2>
          <p>
          </p>
        </section>

        <section id="projects" className="section">
          <Projects
            username="cbgabler"
            endpoint={import.meta.env.PROD ? "/api/projects" : undefined}
            limit={12}
          />
        </section>

        <section id="contact" className="section">
          <h2>Contact</h2>
          <p>
            Reach me at{" "}
            <a href="mailto:you@example.com">you@example.com</a>.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Carson Gabler</span>
      </footer>
    </div>
  );
}
