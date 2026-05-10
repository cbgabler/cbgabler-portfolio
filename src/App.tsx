import LiveActivity from "./components/LiveActivity";
import "./App.css";

type Project = {
  title: string;
  description: string;
  url?: string;
};

const projects: Project[] = [
  {
    title: "Project One",
    description: "A short description of what this project does.",
    url: "#",
  },
  {
    title: "Project Two",
    description: "Another project worth showing off.",
    url: "#",
  },
  {
    title: "Project Three",
    description: "Add as many as you'd like.",
    url: "#",
  },
];

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
          />
        </section>

        <section id="about" className="section">
          <h2>About</h2>
          <p>
          </p>
        </section>

        <section id="projects" className="section">
          <h2>Projects</h2>
          <div className="grid">
            {projects.map((p) => (
              <a key={p.title} href={p.url} className="card">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </a>
            ))}
          </div>
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
