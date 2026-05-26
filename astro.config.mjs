import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// Update this to your custom domain once you have one wired up in
// Cloudflare Pages (Settings → Custom domains). The value here is
// used for the canonical URL, OG tags, and the generated sitemap.
const SITE_URL = "https://cbgabler.pages.dev";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: "auto",
  },
  image: {
    // Sharp ships with Astro; default. Listed here for visibility.
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
