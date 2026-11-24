export const GALLERY_CATEGORIES = [
  "Nature",
  "Landscape",
  "Event",
  "Portrait",
  "Object",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
export type GalleryFilter = "All" | GalleryCategory;

export function isGalleryCategory(value: string): value is GalleryCategory {
  return GALLERY_CATEGORIES.some((category) => category === value);
}