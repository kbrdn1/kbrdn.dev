/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: "fr",
  locales: ["en", "fr"],
  namespaces: [
    "common",
    "home",
    "footer",
    "nav",
    "about",
    "blog",
    "seo",
  ],
  load: ["server"],
  i18nextClient: {
    detection: {
      order: ["querystring", "path"],
    },
  },
};
