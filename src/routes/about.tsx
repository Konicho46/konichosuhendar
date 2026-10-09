import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  beforeLoad: () => { throw redirect({ to: "/", hash: "about", statusCode: 301 }); },
  head: () => ({ meta: [
    { title: "About Us — Nathanael Suhendar" },
    { name: "description", content: "About Us on Nathanael Suhendar's personal portfolio." },
    { property: "og:title", content: "About Us — Nathanael Suhendar" },
    { property: "og:description", content: "Explore about us on Nathanael Suhendar's portfolio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});
