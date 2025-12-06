# About ClockWorksProduction

ClockWorksProduction is a creative collective and production house with a passion for bringing imaginative projects to life. We are involved in various creative endeavors, including game development, animation, and virtual entertainment.

We operate through three distinct branches:

- **CWP Studio** – Our game development arm dedicated to creating enjoyable and interactive learning experiences through games. We aim to explore new ways of learning that are both educational and fun.
- **FrameForge** – Our animation studio that specializes in producing stylized visuals and creative short films. Our process is fueled by "Coffee + Synifig + Passion." You can see examples of our work like "MLBT."
- **PixelPulse** – CWP's in-house VTuber group, a collective of virtual talents focusing on enjoyable learning and fun through streams and videos. AgentBlackTigerStreams is an example of a VTuber within PixelPulse.

Through these branches, ClockWorksProduction strives to push creative boundaries and deliver unique and engaging content.

---

Repository notes (docs/ reorganized):

- `assets/` - CSS and JS were moved to `assets/css/` and `assets/js/` for clear separation of static assets.
- `partials/` - Shared partials such as `nav.html` and `footer.html` were moved to `partials/`.
- `pages/` - Site content pages (about, contact, projects, team) were moved to `pages/` and updated to reference assets using root-relative paths.

If you host this on GitHub Pages, the site root remains `docs/` and these root-relative paths (starting with `/`) will resolve correctly when served from the site domain. If you preview locally by opening files directly, use the files under `pages/` or update paths accordingly.

