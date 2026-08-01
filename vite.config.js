import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

function integrationTags(env) {
  const tags = [];
  const ga4Id = env.VITE_GA4_ID?.trim();
  const verification = env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  const bookingUrl = env.VITE_BOOKING_URL?.trim();

  if (verification) {
    tags.push({
      tag: "meta",
      attrs: { name: "google-site-verification", content: verification },
      injectTo: "head"
    });
  }

  if (/^https:\/\//i.test(bookingUrl ?? "")) {
    tags.push({
      tag: "meta",
      attrs: { name: "mdb-booking-url", content: bookingUrl },
      injectTo: "head"
    });
  }

  if (/^G-[A-Z0-9]+$/i.test(ga4Id ?? "")) {
    tags.push(
      {
        tag: "script",
        attrs: {
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`
        },
        injectTo: "head"
      },
      {
        tag: "script",
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config",${JSON.stringify(ga4Id)});`,
        injectTo: "head"
      }
    );
  }

  return tags;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_BASE_PATH?.trim() || "/",
    plugins: [
      {
        name: "mdb-integrations",
        transformIndexHtml() {
          return integrationTags(env);
        }
      }
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), "index.html"),
          notFound: resolve(process.cwd(), "404.html")
        }
      }
    }
  };
});
