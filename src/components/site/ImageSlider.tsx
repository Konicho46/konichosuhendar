import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ImageSlide = { id: string; image: string; title: string };

export function ImageSlider({ slides, projectTitle }: { slides: ImageSlide[]; projectTitle: string }) {
  const [viewportRef, api] = useEmblaCarousel({ loop: slides.length > 1, align: "start" });
  const [active, setActive] = useState(0);
  const syncActive = useCallback(() => { if (api) setActive(api.selectedScrollSnap()); }, [api]);

  useEffect(() => {
    if (!api) return;
    syncActive();
    api.on("select", syncActive).on("reInit", syncActive);
    return () => { api.off("select", syncActive).off("reInit", syncActive); };
  }, [api, syncActive]);

  if (!slides.length) return null;
  return (
    <section aria-label={`${projectTitle} image slider`} aria-roledescription="carousel" className="min-w-0 border-t border-dashed border-border py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="eyebrow">Image Slider</h2>
        <div className="flex items-center gap-3">
          <span className="mono-label text-muted-foreground" aria-live="polite">{active + 1} / {slides.length}</span>
          {slides.length > 1 && <>
            <Button variant="outline" size="icon" aria-label="Previous slide" onClick={() => api?.scrollPrev()}><ChevronLeft /></Button>
            <Button variant="outline" size="icon" aria-label="Next slide" onClick={() => api?.scrollNext()}><ChevronRight /></Button>
          </>}
        </div>
      </div>
      <div ref={viewportRef} className="overflow-hidden" data-lenis-prevent tabIndex={0} aria-label="Slide images" onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          if (event.key === "ArrowLeft") api?.scrollPrev(); else api?.scrollNext();
        }
      }}>
        <div className="flex touch-pan-y pinch-zoom">
          {slides.map((slide, index) => <figure key={slide.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} aria-hidden={index !== active} className="min-w-0 flex-[0_0_100%]">
            <div className="aspect-[16/10] overflow-hidden rounded-md bg-secondary"><img src={slide.image} alt={slide.title || `${projectTitle} design image ${index + 1}`} loading="lazy" className="h-full w-full object-contain" /></div>
            <figcaption className="display min-h-16 break-words py-5 text-lg leading-relaxed">{slide.title}</figcaption>
          </figure>)}
        </div>
      </div>
      {slides.length > 1 && <div className="flex flex-wrap justify-center gap-1" aria-label="Choose slide">{slides.map((slide, index) => <Button key={slide.id} variant="ghost" size="icon" aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? "true" : undefined} onClick={() => api?.scrollTo(index)} className={cn("h-8 w-8", index === active ? "text-accent" : "text-muted-foreground")}><Circle className={cn("size-2", index === active && "fill-current")} /></Button>)}</div>}
    </section>
  );
}