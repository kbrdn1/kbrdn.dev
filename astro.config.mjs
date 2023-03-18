import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "fr",
        locales: {
          en: "en-US",
          fr: "fr-FR",
        },
      },
    }),
  ],
  site: "https://kbrdn.dev",
});
