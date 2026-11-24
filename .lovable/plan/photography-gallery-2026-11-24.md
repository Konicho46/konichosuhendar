# Photography gallery

## What will change
- Add a dedicated `/gallery` photography page with its own editorial layout, a clear return link to the portfolio, and filters for Nature, Landscape, Event, Portrait, and Object.
- Add a Photography Gallery button to the home page.
- Add a Gallery area to the admin menu where the administrator can upload compressed photos, assign one of the five categories, and manage saved entries.
- Store gallery entries in a new public-readable, admin-managed table, reusing the existing private portfolio image storage and its image optimization flow.

## Technical details
- Add a `gallery_photos` table with image URL, category, optional title, ordering, and timestamps; grant only the roles allowed by its RLS policies.
- Use the existing authenticated CMS pattern, generated database types, and shared button/input components. Give `/gallery` its own title and social metadata.
- Keep the existing portfolio navigation and project detail URLs unchanged.
