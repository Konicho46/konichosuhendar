import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  beforeLoad: () => { throw redirect({ to: "/", hash: "contact", statusCode: 301 }); },
  head: () => ({ meta: [
    { title: "Contact — Nathanael Suhendar" },
    { name: "description", content: "Contact on Nathanael Suhendar's personal portfolio." },
    { property: "og:title", content: "Contact — Nathanael Suhendar" },
    { property: "og:description", content: "Explore contact on Nathanael Suhendar's portfolio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});
