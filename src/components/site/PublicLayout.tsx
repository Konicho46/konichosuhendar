import { useEffect, type ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroyScroll: (() => void) | undefined;
    let scrollToSection: ((target: HTMLElement) => void) | undefined;
    const onSectionNavigation = (event: Event) => {
      const hash = (event as CustomEvent<string>).detail;
      const target = document.getElementById(hash);
      if (!target) return;
      if (scrollToSection) scrollToSection(target);
      else window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 104), behavior: motionPreference.matches ? "instant" : "smooth" });
    };
    window.addEventListener("portfolio:scroll", onSectionNavigation);

    const updateScroll = async () => {
      destroyScroll?.();
      destroyScroll = undefined;
      scrollToSection = undefined;
      if (motionPreference.matches || disposed) return;
      const { default: Lenis } = await import("lenis");
      if (motionPreference.matches || disposed || destroyScroll) return;
      const scroll = new Lenis({
        autoRaf: true,
        anchors: false,
        allowNestedScroll: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.1,
      });
      destroyScroll = () => scroll.destroy();
      scrollToSection = (target) => {
        scroll.resize();
        scroll.scrollTo(target, { offset: -104, duration: 1.1, lerp: 0, force: true });
      };
    };

    void updateScroll();
    motionPreference.addEventListener("change", updateScroll);
    return () => {
      disposed = true;
      motionPreference.removeEventListener("change", updateScroll);
      window.removeEventListener("portfolio:scroll", onSectionNavigation);
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
