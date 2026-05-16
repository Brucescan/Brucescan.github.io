// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://brucescan.github.io",
  base: "/",
  build: {
    assets: "assets",
  },
  integrations: [sitemap()],
  markdown: {
    gfm: true,
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "css-variables",
      defaultColor: false,
    },
  },
});
