import { deepEqual, equal } from "node:assert/strict";
import { GALLERY_CATEGORIES, isGalleryCategory } from "./gallery-categories";

deepEqual(GALLERY_CATEGORIES, ["Nature", "Landscape", "Event", "Portrait", "Object"]);

for (const category of GALLERY_CATEGORIES) {
  equal(isGalleryCategory(category), true);
}

equal(isGalleryCategory("Travel"), false);