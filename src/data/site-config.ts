/**
 * Central site content. Edit this file to update everything visitor-facing:
 * name, bio, skills, contact info, etc.
 *
 * Lines marked with `// TODO:` are placeholders — please replace them
 * with the real thing before sharing the site.
 */

export const SITE = {
  /** Full name shown in the hero and the page title. */
  name: "Carson Gabler",
  /** Short label used in the title bar (e.g. "carson@portfolio"). */
  user: "carson",
  host: "portfolio",
  /** GitHub login. Drives the Projects feed. */
  username: "cbgabler",
  /** Initials shown in the top-left brand mark. */
  initials: "CG",

  /** One-line role / role descriptor under your name. */
  title: "Analytics & Data Engineer",
  /** Short blurb under the title in the hero. */
  tagline:
    "I build data pipelines, internal tools, and the occasional weird side project. Mostly TypeScript and SQL.",

  /** Optional one-liner about what you're focused on right now. */
  currently: "Wiring dbt projects to the things that need them.",

  /** Multi-paragraph About section. Each item is its own paragraph. */
  about: [
    "I'm an engineer who lives in the seam between data and product. Most days that looks like SQL and dbt models, with detours into TypeScript whenever an internal tool needs a UI.",
    "I care about systems that are obvious — names that match the thing, defaults that match the use, and metrics you can actually trust. The opposite of that is what I usually end up cleaning up.",
    "Outside of work I tinker on small CLIs, data toys, and the occasional weekend rewrite. This site is one of them.",
  ],

  /** Where you are. Plain text; rendered as-is. */
  location: "United States",

  /** Contact + social. Set any field to `null` to hide it. */
  social: {
    email: "hello@cbgabler.dev", // TODO: real address
    github: "cbgabler",
    githubUrl: "https://github.com/cbgabler",
    linkedin: "carsongabler",
    linkedinUrl: "https://www.linkedin.com/in/carsongabler", // TODO: confirm slug
    twitter: null as string | null,
    twitterUrl: null as string | null,
    bluesky: null as string | null,
    blueskyUrl: null as string | null,
    resumeUrl: null as string | null, // e.g. "/resume.pdf"
  },

  /** Skill groups rendered in the Skills section. */
  skills: [
    {
      category: "languages",
      items: ["TypeScript", "Python", "SQL", "Bash"],
    },
    {
      category: "data",
      items: ["dbt", "Postgres", "Snowflake", "BigQuery", "Airflow"],
    },
    {
      category: "frontend",
      items: ["React", "Vite", "CSS"],
    },
    {
      category: "infra",
      items: ["Docker", "GitHub Actions", "Vercel", "AWS"],
    },
  ] as const,
};

export type SocialKey =
  | "email"
  | "github"
  | "linkedin"
  | "twitter"
  | "bluesky"
  | "resume";

/** The nav items in the header. */
export const NAV_LINKS = [
  { label: "about", href: "/#about" },
  { label: "projects", href: "/#projects" },
  { label: "skills", href: "/#skills" },
  { label: "contact", href: "/#contact" },
];
