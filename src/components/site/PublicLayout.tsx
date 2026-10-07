import { useEffect, type ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroyScroll: (() => void) | undefined;

    const updateScroll = async () => {
      destroyScroll?.();
      destroyScroll = undefined;
      if (motionPreference.matches || disposed) return;
      const { default: Lenis } = await import("lenis");
      if (motionPreference.matches || disposed || destroyScroll) return;
      const scroll = new Lenis({
        autoRaf: true,
        anchors: true,
        allowNestedScroll: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.1,
      });
      destroyScroll = () => scroll.destroy();
    };

    void updateScroll();
    motionPreference.addEventListener("change", updateScroll);
    return () => {
      disposed = true;
      motionPreference.removeEventListener("change", updateScroll);
      destroyScroll?.();
    };
  }, []);

  return (
    <div className="public-theme flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
