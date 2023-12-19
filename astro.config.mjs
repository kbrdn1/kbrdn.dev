import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import vue from "@astrojs/vue";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), sitemap(), mdx(), vue()],
  i18n: {
    defaultLocale: "fr",
    locales: ["en", "fr"],
    routing: {
      prefixDefaultLocale: false
    },
    fallback: {
      "en": "fr"
    }
  },
  output: "server",
  adapter: vercel(),
  experimental: {
    contentCollectionCache: true,
    optimizeHoistedScript: true,
  },
});