import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/work/")({
  beforeLoad: () => { throw redirect({ to: "/", hash: "project", statusCode: 301 }); },
  head: () => ({ meta: [
    { title: "Project — Nathanael Suhendar" },
    { name: "description", content: "Project on Nathanael Suhendar's personal portfolio." },
    { property: "og:title", content: "Project — Nathanael Suhendar" },
    { property: "og:description", content: "Explore project on Nathanael Suhendar's portfolio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});
