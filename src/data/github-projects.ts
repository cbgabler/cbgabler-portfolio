/** Public GitHub repositories that do not have a dedicated case study yet. */
export const GITHUB_PROJECTS = [
  {
    name: "Small Shell",
    repo: "small-shell",
    summary:
      "A small Unix-style shell written in C with command execution and process management.",
    tech: ["C", "POSIX", "Unix"],
    date: "Nov 2024",
  },
  {
    name: "Roam Atlas",
    repo: "travel-app",
    summary:
      "A full-stack travel log with a React frontend and MongoDB-backed backend.",
    tech: ["JavaScript", "React", "MongoDB"],
    date: "Nov 2024",
  },
  {
    name: "Iron Ledger",
    repo: "gymdb-php",
    summary:
      "A web-based gym management system for members, employees, classes, memberships, equipment, and feedback.",
    tech: ["JavaScript", "PHP", "MySQL"],
    date: "Feb 2025",
  },
  {
    name: "One-Time Pad",
    repo: "otp",
    summary:
      "A systems programming project built around compiled C programs and multi-process test workflows.",
    tech: ["C", "Linux", "Networking"],
    date: "Mar 2025",
  },
  {
    name: "Rep Circuit",
    repo: "excercise-app",
    summary:
      "A full-stack workout log for tracking exercises, dates, weights, repetitions, and training history.",
    tech: ["JavaScript", "React", "MongoDB"],
    date: "Aug 2024",
  },
  {
    name: "Vector Raycast Simulation",
    repo: "py-raycast",
    summary:
      "A Python ray tracer that calculates vector collisions and renders lighting, shadows, and complete images.",
    tech: ["Python", "Computer graphics", "Ray tracing"],
    date: "Jan 2023",
  },
  {
    name: "JavaGame",
    repo: "JavaGame",
    summary:
      "A Java game project developed as an iterative software engineering and refactoring exercise.",
    tech: ["Java", "IntelliJ", "Game development"],
    date: "Jun 2023",
  },
  {
    name: "Developer Bootcamp Project",
    repo: "bootcamp-project-2023",
    summary: "A project from the 2023 Cal Poly Developer Bootcamp.",
    tech: ["TypeScript", "Web development"],
    date: "Oct 2023",
    status: "fork",
  },
] as const;
