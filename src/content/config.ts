import { defineCollection, z } from "astro:content";

/**
 * Projects collection. To add a new case study, drop a new `.mdx` file in
 * `src/content/projects/`. Frontmatter is type-checked against the schema
 * below — the build will fail loudly if anything is missing.
 */
const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      /** Short awards string, e.g. "1st place + Best Agentic Infrastructure — BeaverHacks 2026". */
      awards: z.string().optional(),
      /** Display date or range. */
      date: z.string(),
      /** Tech stack pills. Keep short — display gets noisy past ~10. */
      tech: z.array(z.string()),
      /** Canonical repo URL. */
      repoUrl: z.string().url().optional(),
      /** Optional live demo / artifact link. */
      liveUrl: z.string().url().optional(),
      /** Sorting + display order on the homepage. Lower = earlier. */
      order: z.number().default(100),
      /** True = featured (rendered as the oversize/headline card). */
      featured: z.boolean().default(false),
      /** Optional hero image for the card + detail page. */
      hero: image().optional(),
      /** Alt text for the hero image. */
      heroAlt: z.string().optional(),
      /** Hide from the site without deleting the file. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
