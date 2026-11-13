# Bharosa Community Services: website redesign handoff

Static HTML mockups of the refreshed bharosa.com.au design, exported from the design canvas. Use them as the visual and content reference for building the new site (planned: a custom WordPress theme replacing the current Elementor build).

## What's in this folder

```
index.html                                Home
services.html                             Our Services (lists all 11 services)
about.html                                About Us
contact.html                              Contact Us
referrals.html                            NDIS Referral Form (five-step form)
sil-vacancy.html                          SIL Vacancies (searchable list of current properties)
sil-properties/<name>.html                One detail page per SIL property (built by a script, see below)
services/assist-personal-activities.html  Assist Personal Activities
services/social-community-access.html     Assistance with Social and Community Access
services/accessible-transport.html        Accessible Transport Services
services/hidpa.html                       High Intensity Daily Personal Activities (HIDPA)
services/group-centre-activities.html     Group / Centre Based Activities
services/household-tasks.html             Assistance in Household Tasks
services/community-nursing.html           Community Nursing Care (rebuilt from the live page)
services/supported-independent-living.html Supported Independent Living (rebuilt from the live page)
services/short-medium-term-accommodation.html Short & Medium Term Accommodation (rebuilt from the live page)
services/individualised-living-option.html Individualised Living Option (rebuilt from the live page)
services/support-coordination.html        Support Coordination (rebuilt from the live page)
assets/images/                            Photos, logos, flags, NDIS badge
assets/icons/                             Service and care icons (PNG)
design-source/                            Original canvas files (.dc.html), including tablet and phone frames
```

Open any `.html` file directly in a browser. Pages link to each other through the nav, footer and service cards. Links to pages that are not designed yet (SIL Vacancy, Referrals, the six services without pages, Staff Portal, Privacy, Accessibility) are `href="#"`.

Main nav (client request): Home, About Us, Our Services, SIL Vacancy, and a Referrals button. Contact Us sits in the top contact strip.

## Interim working site (added 2026-10-30)

The mockups now work as a browsable static site:

- `assets/site.js` and `assets/site.css` are loaded by every page. They add the mobile/tablet menu, form checks, the message character counter, and hide the testimonial arrows while there is only one testimonial.
- Forms have no server yet. The referral form collects health and NDIS details, so it must move to secure form handling (not email) before launch; file uploads are not possible until then.
- Forms have no server yet. After checking required fields they open the visitor's email app with a pre-filled message to info@bharosa.com.au. Replace this with real form handling in the WordPress build.
- Links to pages not built here (news articles, NDIS Funding Explained, Privacy Policy, Staff Portal, social profiles) point to the matching page on the live bharosa.com.au. "Daily Life Skill Development Support" was removed from the site at the client's request. The footer Accessibility link was removed because no page exists.
- The language selector in the top strip still does nothing.

## Adding or updating a SIL property

Property detail pages are generated, not edited by hand:

1. Put the photos in `assets/images/sil-properties/<name>/` as `01.webp`, `02.webp` and so on. The first photo is the main one.
2. Add or edit the property's entry in `sil-properties/properties.json` (copy an existing entry). `extra_sections` is optional, for things like "About your current housemate".
3. Run `python tools/build_sil_properties.py`. It writes `sil-properties/<name>.html`, using `sil-properties/_template.html` for the layout and the header and footer from `sil-vacancy.html`.
4. Add a card for the property on `sil-vacancy.html` (and on the home page if it should be featured), linking to the new page.

Re-run the script after changing the site header or footer so the property pages pick it up.

## How the HTML is written

- Every page is self-contained: a `<style>` block in `<head>` holds hover states, the marquee animation and the responsive rules; everything else is inline `style=""`.
- Responsive breakpoints: `max-width: 1100px` (tablet) and `max-width: 700px` (phone). Layout classes such as `r-2col`, `r-3col`, `r-pad`, `rs-cards`, `hh-3col`, `ct-2col` exist only to hook those media queries.
- The header, Refer a Participant panel and footer are identical on every page and should become shared template parts.
- The `design-source/*-Tablet` and `*-Phone` files are copies of the desktop pages shown at 834px and 390px. They are not separate builds.

Suggested first step: pull the repeated inline styles into a shared stylesheet with CSS variables, then turn the header, footer and repeated sections (hero, How it Works, quote form, FAQ) into reusable template parts.

## Design tokens

| Token | Value | Use |
|---|---|---|
| Brand teal | `#00565e` | Primary buttons, dark sections, headings accents |
| Brand teal (hover) | `#003f45` | Button hover |
| Accent teal | `#14cac8` | Highlights on dark backgrounds, accent buttons (use dark text `#00343a` on it) |
| Accent text teal | `#0a7f7d` | Teal text on white (passes contrast) |
| Tint | `#edf4f6` | Light section backgrounds, cards |
| Aqua tint | `#e1f9f9` | Icon tiles, chips |
| Hero dark | `#0d2f34` | Behind hero images |
| Text | `#2f3b3d` headings, `#3d4a4c` body, `#55676a` muted |
| Border | `#dbe7ea` / `#cfdcdf` (form fields) |

- Fonts (Google Fonts): **Outfit** 300–700 for everything, **Yellowtail** for the handwritten accent words.
- Radii: buttons are pills; cards 18–22px; large panels 24–32px; hero bottom-right corner 120px.
- Buttons: 50–54px tall on desktop, at least 44px everywhere.

## Content status

All placeholders are filled. FAQ answers, the Household Tasks benefits and other copy were taken word for word from the live site (November 2026); the two Contact page maps are keyless Google Maps embeds.

- Service page hero images are in `assets/images/services/`. The home hero uses `assets/images/hero-image.webp`; swap in the planned muted-loop video if one is supplied.
- Images in `assets/` were cut from screenshots of the live site. Swap in the original, higher-resolution files where available.

## Hosting on GitHub Pages

The site is plain HTML, so it can be served as-is. Push this folder to a repository and enable Pages from the main branch, root folder. The empty `.nojekyll` file tells Pages to serve the files without processing. Forms open the visitor's email app, so they work on Pages too.

## Known content issues to check with the client

- Assist Personal Activities: the last FAQ ("How to contact an NDIS support coordinator?") is about Support Coordination; it is the same on the live site.
- Accessible Transport: the "Who this service is for" text is copied from the Social and Community Access page on the live site.
- Home says participants "aged 18 to 65"; About says "participants of all ages".
- Mobile numbers are shown as "+61 0466 325 591"; the usual format drops the 0 after +61.
- Some short lines are new copy written for the redesign (for example the About heading, value card lines, small script labels). Review before launch.

## Accessibility notes already built in

Real `<button>`, `<a>`, `<label>` and `<fieldset>` elements; alt text on content images; decorative SVGs marked `aria-hidden`; reduced-motion support for the gallery marquee; contrast-checked text colours.
