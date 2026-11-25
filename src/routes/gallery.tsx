import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GALLERY_CATEGORIES, isGalleryCategory } from "@/lib/gallery-categories";
import { galleryPhotosQuery, type GalleryFilter } from "@/lib/portfolio";

export const Route = createFileRoute("/gallery")({
  validateSearch: (search: Record<string, unknown>) => {
    const requestedCategory = search["category"];
    return {
      category:
        typeof requestedCategory === "string" && isGalleryCategory(requestedCategory)
          ? requestedCategory
          : "All",
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryPhotosQuery),
  head: ({ loaderData }) => {
    const coverImage = loaderData?.[0]?.image_url;
    const socialImage = coverImage?.startsWith("https://")
      ? [
          { property: "og:image", content: coverImage },
          { name: "twitter:image", content: coverImage },
        ]
      : [];
    return {
      meta: [
        { title: "Photography — Nathanael Suhendar" },
        { name: "description", content: "A personal photography collection by Nathanael Suhendar." },
        { property: "og:title", content: "Photography — Nathanael Suhendar" },
        { property: "og:description", content: "Browse selected photographs by category." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...socialImage,
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="public-theme flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="mono-label text-accent">Photography</p>
        <h1 className="display mt-4 text-3xl">Gallery unavailable</h1>
        <p role="alert" className="mt-4 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
        <Button asChild variant="outline" className="mt-7 rounded-full">
          <Link to="/"><ArrowLeft /> Back to portfolio</Link>
        </Button>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">Photography gallery not found.</div>,
  component: PhotographyGallery,
});

function PhotographyGallery() {
  const { data: photos } = useSuspenseQuery(galleryPhotosQuery);
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/gallery" });
  const filters: GalleryFilter[] = ["All", ...GALLERY_CATEGORIES];
  const visiblePhotos = category === "All" ? photos : photos.filter((photo) => photo.category === category);

  function chooseCategory(nextCategory: GalleryFilter) {
    void navigate({ search: { category: nextCategory } });
  }

  return (
    <div className="public-theme min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="portfolio-shell flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/" className="mono-label inline-flex min-h-10 items-center gap-2 text-muted-foreground transition-colors hover:text-accent">
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>
          <Link to="/" className="display text-sm sm:text-base">Nathanael Suhendar<span className="text-accent">.</span></Link>
        </div>
      </header>

      <main>
        <section className="portfolio-shell grid gap-7 pb-10 pt-12 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-14 md:pt-20">
          <div>
            <p className="mono-label text-accent">A personal photo journal</p>
            <h1 className="display mt-4 text-5xl leading-tight sm:text-7xl">Photography<span className="text-accent">.</span></h1>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:justify-self-end md:text-base">
            Selected moments across nature, landscapes, events, portraits, and objects.
          </p>
        </section>

        <div className="sticky top-0 z-20 border-y border-border bg-background/95 backdrop-blur-md">
          <div className="portfolio-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
            <nav aria-label="Filter photographs by category" className="flex flex-wrap gap-1.5">
              {filters.map((filter) => {
                const count = filter === "All" ? photos.length : photos.filter((photo) => photo.category === filter).length;
                return (
                  <Button
                    key={filter}
                    type="button"
                    size="sm"
                    variant={category === filter ? "default" : "ghost"}
                    aria-pressed={category === filter}
                    onClick={() => chooseCategory(filter)}
                    className="rounded-full mono-label"
                  >
                    {filter}<span className="ml-1 opacity-70">{count}</span>
                  </Button>
                );
              })}
            </nav>
            <p className="mono-label text-muted-foreground">{visiblePhotos.length} {visiblePhotos.length === 1 ? "photo" : "photos"}</p>
          </div>
        </div>

        <section aria-label="Photography collection" className="portfolio-shell py-8 md:py-12">
          {visiblePhotos.length ? (
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {visiblePhotos.map((photo, index) => (
                <figure key={photo.id} className="mb-5 break-inside-avoid">
                  <div className="overflow-hidden bg-card">
                    <img
                      src={photo.image_url}
                      alt={photo.title || `${photo.category} photograph ${index + 1}`}
                      loading="lazy"
                      className="block h-auto w-full transition-transform duration-700 ease-out hover:scale-[1.02]"
                    />
                  </div>
                  <figcaption className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
                    <span className="display text-sm">{photo.title || photo.category}</span>
                    <span className="mono-label text-muted-foreground">{photo.category}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="border-y border-dashed border-border py-20 text-center">
              <p className="display text-2xl">No photographs yet</p>
              <p className="mono-label mt-3 text-muted-foreground">{category === "All" ? "New photographs will appear here." : `Nothing filed under ${category} yet.`}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="portfolio-shell flex flex-wrap items-center justify-between gap-4 py-6">
          <span className="mono-label text-muted-foreground">Nathanael Suhendar · Photography</span>
          <Link to="/" className="mono-label inline-flex items-center gap-2 text-accent hover:underline">
            Return to main portfolio <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}