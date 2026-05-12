/**
 * Per-project narrative content for the detail pages.
 *
 * Keyed by the GitHub repository name (the `name` field, not `full_name`).
 * Anything you don't define here falls back to the GitHub `description`.
 *
 * Images: drop the files into `public/projects/<repo-name>/<image>.png`
 * and reference them as `/projects/<repo-name>/<image>.png`.
 *
 * Example:
 *
 *   "cbgabler-portfolio": {
 *     tagline: "The site you're looking at, built with React + Vite.",
 *     body: [
 *       "A live, terminal-themed portfolio that pulls each repo's last commit",
 *       "from GitHub and renders the project list as a git log.",
 *     ],
 *     images: [
 *       {
 *         src: "/projects/cbgabler-portfolio/projects-list.png",
 *         alt: "Projects list rendered as a git log",
 *         caption: "Projects view",
 *       },
 *     ],
 *     links: [
 *       { label: "Live site", url: "https://cbgabler.dev" },
 *     ],
 *   },
 */

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ProjectLink = {
  label: string;
  url: string;
};

export type ProjectContent = {
  /** Optional override for the display name. Defaults to the repo name. */
  displayName?: string;
  /** One-line summary shown under the title. */
  tagline?: string;
  /** Paragraphs of body content. Rendered as plain text, one per paragraph. */
  body?: string[];
  /** Screenshots / diagrams. Rendered in order, below the body. */
  images?: ProjectImage[];
  /** Extra links rendered in the detail page footer. */
  links?: ProjectLink[];
};

export const PROJECT_CONTENT: Record<string, ProjectContent> = {
  // Add entries here, keyed by repo name. See the comment above for the shape.
};

export function getProjectContent(name: string): ProjectContent | undefined {
  return PROJECT_CONTENT[name];
}
