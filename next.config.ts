import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Dev runs Turbopack (Serwist is disabled in dev); the production build
  // uses webpack ("next build --webpack") because @serwist/next injects a
  // webpack plugin. Revisit when Serwist's Turbopack support stabilizes:
  // https://github.com/serwist/serwist/issues/54
  turbopack: {},
};

export default withSerwist(nextConfig);
