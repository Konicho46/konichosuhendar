<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep public portfolio styling scoped under `.public-theme` so the admin CMS retains its independent interface; this allows visual redesigns without destabilizing content management.
- Initialize Lenis only after the public layout mounts and destroy it on unmount or reduced-motion changes; smooth scrolling must never alter the CMS or native touch scrolling.
- Keep public section content on the home route with hash navigation and redirect legacy section URLs to their anchors; preserve `/work/$slug` for case studies so published project links remain valid.
- Keep the contact form and project catalogue in reusable public section modules; this preserves existing submission and filtering behavior while the home route owns page composition.
