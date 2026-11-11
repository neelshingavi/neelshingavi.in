
# MASTER PROMPT — PHASE C
# FINAL VISUAL REFINEMENT, INTERACTION QA & PRODUCTION READINESS
# PROJECT: NEEL SHINGAVI PORTFOLIO
# WEBSITE: https://neelshingavi.in/

Act as a principal frontend engineer, award-winning
creative developer, senior product designer, performance
engineer and accessibility specialist.

Phase A: Bug remediation and data integrity.
Phase B: Complete visual redesign and creative direction.

Both phases have been implemented.

Your responsibility is to bring the existing portfolio
to its final quality standard.

This is NOT another redesign from scratch.

The existing design direction is:

CINEMATIC EDITORIAL ENGINEERING.

The site should feel like a premium digital experience
created by a highly skilled software/product engineer.

The final objective:

- Visually exceptional.
- Technically accurate.
- Responsive across devices.
- Fast and stable.
- Fully functional.
- Accessible.
- Consistent.
- Trustworthy.

Do not add features just to make the portfolio bigger.

==================================================
0. EXECUTION RULES
==================================================

Before doing anything:

1. Inspect the actual current repository.
2. Inspect the latest Phase A and Phase B implementations.
3. Read the complete package.json and lockfile.
4. Inspect the entire component hierarchy.
5. Inspect all public assets.
6. Inspect all project SVG blueprints.
7. Inspect the complete CSS cascade.
8. Inspect the navigation and routing.
9. Inspect all existing animations.
10. Inspect all API integrations.

Run git status.

IMPORTANT:
The existing branch contains previous local changes.

Preserve every staged and unstaged change.

Do not reset, revert or discard existing work.

Do not assume that the implementation reports are
perfectly accurate.

The actual source code is the source of truth.

Run the existing production build before modifying code.

Do not deploy, publish, push commits or overwrite
production configuration.

==================================================
1. TASK A — COMPLETE VISUAL AUDIT
==================================================

Capture the CURRENT implementation before making changes.

Capture actual browser screenshots at:

- 1440 x 900.
- 1366 x 768.
- 1024 x 768.
- 768 x 1024.
- 390 x 844.
- 360 x 800.

Capture:

1. Hero.
2. Selected Work.
3. Systems.
4. TradersDesk architecture.
5. QueryPilot pipeline.
6. Coding activity.
7. Experience.
8. Achievements.
9. Skills.
10. Architecture.
11. Contact.
12. Footer.
13. Case Study Modal.
14. Full-page desktop.
15. Full-page mobile.

Inspect the screenshots visually.

Do not just capture them and claim completion.

Identify:

- Inconsistent spacing.
- Poor alignment.
- Weak typographic hierarchy.
- Too much repetitive card styling.
- Text density.
- Oversized visual elements.
- Unbalanced whitespace.
- Poor screenshot cropping.
- Repeated section introductions.
- Redundant content.
- Modal sizing issues.
- Mobile typography problems.
- Poor diagram readability.
- Inconsistent accent colours.

Create a concise baseline visual audit.

==================================================
2. TASK B — REMOVE INFORMATION ARCHITECTURE DUPLICATION
==================================================

The Phase B implementation contains:

- #systems, which includes TradersDesk and QueryPilot
  architecture deep dives.
- #architecture, which presents another architecture
  workbench.

This may duplicate the same technical information.

Inspect the complete page.

Your objective is to reduce repetition.

Recommended structure:

#systems:
A concise overview of my engineering capabilities.

#work:
The five selected projects and their main case studies.

Individual project case study:
The detailed project architecture and technical decisions.

#architecture:
Only retain this as a separate substantive section
if it contributes genuinely distinct information.

If it repeats the project architecture content,
consolidate it.

IMPORTANT:
Do not break existing section anchors.

Preserve old anchor IDs through appropriate aliases
or scroll targets if sections are consolidated.

Update navigation consistently.

Do not remove valuable technical information.

The objective is better information architecture,
not simply fewer sections.

Review the overall page length and remove repeated
descriptions, repeated metrics and unnecessary
intermediate content.

==================================================
3. TASK C — AUTHENTIC PROJECT VISUALS
==================================================

This is the most important visual refinement.

The current Phase B implementation uses five custom
vector architecture blueprints.

These are illustrations, not actual product screenshots.

Do not present them as captured application interfaces.

A. ASSET CLASSIFICATION

Inspect:

public/assets/projects/

For each project, identify:

- Actual application screenshot.
- Architecture illustration.
- Pipeline illustration.
- Certificate.
- Demo image.
- Promotional image.
- Missing visual asset.

Create a proper project visual schema if necessary.

Suggested structure:

{
  previewImage: null,
  architectureImage: "...",
  previewType: "architecture",
  imageAlt: "..."
}

Use sensible existing naming conventions.

B. BLUEPRINT LABELS

Clearly distinguish architecture illustrations
from actual software screenshots.

Suggested small visual labels:

"ARCHITECTURE BLUEPRINT"
"SYSTEM DESIGN"
"PIPELINE VISUALIZATION"

Do not use:
"PRODUCT SCREENSHOT"
unless the asset is genuinely an application screenshot.

C. VISUAL PRIORITY

If a genuine screenshot exists:

- Make it the primary visual.
- Keep its aspect ratio.
- Use appropriate cropping.
- Allow a zoom or lightbox preview.

If a genuine screenshot does not exist:

- Use the existing architecture illustration.
- Label it honestly.
- Maintain a premium visual composition.
- Do not use fake stock dashboards.
- Do not generate invented application interfaces.

D. FIVE PROJECTS

Verify each asset path:

TradersDesk:
public/assets/projects/tradersdesk/

QueryPilot:
public/assets/projects/querypilot/

PayPerUseAI:
public/assets/projects/payperuseai/

CertiCraft:
public/assets/projects/certicraft/

FounderFlow:
public/assets/projects/founderflow/

Check all image files for:

- Successful loading.
- Appropriate dimensions.
- Correct SVG viewBox.
- No clipped labels.
- No overflowing diagrams.
- Mobile legibility.
- Correct contrast.
- Appropriate alt descriptions.

E. FALLBACK IMPLEMENTATION

The Phase B report describes automatic architecture
blueprint fallback when application screenshots
are added.

Inspect whether this actually exists.

If it does not, implement an explicit fallback system.

Do not rely on a CSS background accidentally remaining
behind an opaque image.

A failed screenshot must never leave an empty project card.

==================================================
4. TASK D — PROJECT CASE STUDY EXPERIENCE
==================================================

Inspect ProjectCaseStudyModal.jsx and caseStudies.js.

The case study experience is one of the most valuable
parts of the portfolio.

Refine it substantially.

A. INFORMATION HIERARCHY

Each project case study should have:

1. Project title and category.
2. Short overview.
3. Problem being addressed.
4. Product and intended users.
5. My specific contribution.
6. Architecture overview.
7. Technology stack.
8. Technical challenges.
9. Engineering decisions and trade-offs.
10. Verified impact.
11. Available demonstration or repository links.

Use actual content from the project data.

Do not invent missing implementation details.

B. CASE STUDY LAYOUT

Use a clean editorial presentation.

Possible composition:

- Large project title.
- Small metadata row.
- Large visual or architecture blueprint.
- Sectioned technical narrative.
- Distinct metric blocks.
- Related architecture explorer.
- Clear external links.

Do not make the visitor read one enormous text panel.

Use progressive information hierarchy.

C. MODAL USABILITY

Verify:

- Correct focus trap.
- Focus restoration.
- Escape closure.
- Background scroll locking.
- Screen reader labelling.
- Keyboard activation.
- Responsive internal scrolling.
- Correct behaviour at small heights.
- Proper z-index and backdrop layering.

A long case study should not become a tiny scrollable
dialog inside an already scrollable page.

If content justifies a standalone project route,
evaluate using a real navigable case-study page.

Do not introduce a heavyweight router unnecessarily.

At minimum, support stable deep links to individual
case studies if the current application architecture
allows it without breaking existing anchors.

Ensure browser back behaviour is intuitive.

D. TECHNICAL CLAIM VERIFICATION

Audit every case study statement.

In particular, inspect:

TradersDesk:
- SQLite transaction guarantees.
- Mutation tracking.
- Push/pull synchronization.
- Offline functionality.
- Client application architecture.
- PostgreSQL persistence.

QueryPilot:
- PostgreSQL schema.
- LLM integration.
- LangChain usage.
- SQL validation.
- AST parsing.
- Data retrieval.
- Business insights.

PayPerUseAI:
- FastAPI.
- SSE inference proxy.
- Algorand integration.
- PyTeal contracts.
- Escrow and payment verification.

CertiCraft:
- CSV processing.
- SHA-256 use.
- QR verification.
- PDF generation.
- Email delivery.

FounderFlow:
- Scoring engine.
- Gantt dependencies.
- Financial forecasting.

If the actual implementation cannot substantiate
a claim, rewrite it accurately or flag it.

Do not use words such as "production-grade",
"enterprise scale" or "zero-latency" without evidence.

==================================================
5. TASK E — REFINED VISUAL SYSTEM
==================================================

The existing Phase B design system is a good foundation.

Preserve its art direction.

Colours:

- Obsidian: #0b0c09
- Warm white: #f4f0e6
- Neon lime: #bff205
- Electric violet: #a872ff

Keep coral and cyan limited to functional contexts.

Do not introduce another colour palette.

A. TYPOGRAPHY

Audit the actual loaded font files and font weights.

Use:

- Instrument Serif for editorial display.
- Bricolage Grotesque for main interface text.
- JetBrains Mono for technical metadata.

Check:
- Actual font loading.
- Fallback behaviour.
- Font weights.
- Line heights.
- Letter spacing.
- Responsive scaling.

Ensure font fallback doesn't produce sudden layout shifts.

B. CONTRAST

Recalculate actual contrast ratios.

Pay particular attention to:
- Muted metadata.
- Micro-labels.
- Coral text.
- Cyan text.
- Disabled states.
- Focus indicators.

Do not use low-contrast colours for meaningful
small text.

Do not rely on colour alone to communicate status.

C. CONSISTENT VISUAL TOKENS

Consolidate existing design tokens where practical.

Establish a clear source of truth for:

- Colours.
- Typography.
- Spacing.
- Section padding.
- Container width.
- Borders.
- Radius.
- Shadows.
- Z-index.
- Motion timing.

Do not perform a blind CSS rewrite.

Preserve responsive behaviour.

D. VISUAL RHYTHM

Review the whole page.

Alternate intentionally between:

- Editorial typography.
- Large project visuals.
- Technical diagrams.
- Timeline content.
- Minimal achievement layouts.
- Spacious contact sections.

Not all sections should look like cards.

Not every heading needs a kicker.

Not every section needs an animated transition.

Make the design look excellent even when all
animations are disabled.

==================================================
6. TASK F — HERO AND PRELOADER FINAL REFINEMENT
==================================================

Preserve the existing cinematic video.

Review:

- Text/video balance.
- Face visibility.
- Headline alignment.
- CTA hierarchy.
- Capability selector placement.
- Reactive light position.
- Background typography.
- Mobile composition.

The primary action should be:
"Explore Selected Work".

The secondary action should be:
"Resume (PDF)".

Do not invent job availability.

Phase A had an unresolved owner confirmation.

Unless this is confirmed, use a neutral label such as:

"PUNE, INDIA • PRODUCT ENGINEER"

Review the preloader.

Prefer showing meaningful hero content immediately.

If the 150ms transition creates unnecessary flicker,
remove it completely.

Do not create fake loading progress.

Do not delay the page's actual content.

==================================================
7. TASK G — MOTION AND INTERACTION FINALIZATION
==================================================

The portfolio already has many animations.

Do not add more by default.

Review the entire interaction system.

Remove redundant effects.

Prioritize:

- Consistent motion duration.
- Consistent easing.
- Subtle hover behaviour.
- Smooth modal transitions.
- Predictable focus states.
- Correct scroll-trigger cleanup.
- No animation on hidden sections.
- Reduced-motion compatibility.

The Phase B proposal mentions SVG line-draw effects.

Only implement them if they materially improve
understanding of the diagram.

Avoid:
- Continuous particles.
- Multiple competing glows.
- Cursor gimmicks.
- Excessive blur.
- Aggressive parallax.
- Long entrance animations.
- Scroll hijacking.

Do not introduce GSAP or another animation library
if existing tools can perform the task.

==================================================
8. TASK H — RESPONSIVE AND CROSS-BROWSER QA
==================================================

Perform actual browser testing.

Test widths:

- 360px.
- 375px.
- 390px.
- 430px.
- 768px.
- 1024px.
- 1366px.
- 1440px.

Test heights:
- 667px.
- 768px.
- 844px.
- 900px.
- 1024px.

Test browsers where available:

- Chromium.
- Safari/WebKit.
- Firefox.

Pay particular attention to:

- Cinematic video behaviour.
- Sticky navigation.
- Mobile drawer.
- SVG scaling.
- Case study dialog.
- Coding calendar.
- Architecture explorers.
- Project screenshots.
- Contact form.
- Footer.

Check:
- Horizontal overflow.
- Text clipping.
- Image distortion.
- Overlapping sections.
- Hidden buttons.
- Incorrect sticky positioning.
- Modal overflow.
- Inconsistent font rendering.

Do not use body-level overflow:hidden to conceal defects.

Fix the elements that cause actual overflow.

The mobile website must feel intentionally designed,
not like a compressed desktop website.

==================================================
9. TASK I — ACCESSIBILITY FINAL AUDIT
==================================================

The implementation reports claim several accessibility
improvements.

Independently verify them.

Test:

- Keyboard-only navigation.
- Tab order.
- Arrow key behaviour.
- Escape behaviour.
- Modal focus containment.
- Focus restoration.
- Screen reader labels.
- Dialog semantics.
- Expandable panel relationships.
- Navigation semantics.
- Colour contrast.
- Reduced-motion preferences.
- Touch target sizes.
- Form validation and error announcements.

Check all interactive cards and architecture nodes.

Do not make decorative SVG elements keyboard-focusable
unless they actually provide an interaction.

Use native buttons and links.

For the coding calendar, provide a useful accessible
alternative to hundreds of keyboard stops.

Use automated accessibility testing where available,
but inspect important interaction sequences manually.

==================================================
10. TASK J — PERFORMANCE AND LOADING OPTIMIZATION
==================================================

This task must rely on real measurements.

A. BASELINE

Before optimizing:

- Build production output.
- Serve the actual production build.
- Measure Lighthouse.
- Inspect browser network requests.
- Measure JavaScript chunks.
- Measure CSS transfer sizes.
- Check image loading.
- Check hero loading.
- Check LCP, CLS and TBT.

Record the environment and test conditions.

B. JAVASCRIPT

Phase B reports:

- Approximately 599 KB total JavaScript.
- Approximately 196 KB gzipped across chunks.
- Approximately 104 KB CSS.

Inspect the actual chunk files.

Determine:

- Which chunks are loaded initially.
- Which chunks are loaded on demand.
- Whether code splitting is useful.
- Whether heavy below-the-fold components need lazy loading.
- Whether animation dependencies are duplicated.
- Whether unused code remains.

Do not optimize solely to reduce a displayed number.

The initial critical path matters most.

C. HERO VIDEO

Preserve the existing 280-frame hero video architecture.

Inspect:
- Fetch timing.
- Blob creation.
- Object URL lifecycle.
- Preloading.
- Mobile behaviour.
- Reduced-motion behaviour.
- Network conditions.
- Safari compatibility.

Verify the video isn't downloaded unnecessarily
on ineligible devices.

Keep the poster as a reliable first-paint experience.

D. IMAGES

All project images must have:

- Appropriate dimensions.
- Correct formats.
- Explicit aspect ratios.
- Lazy loading where appropriate.
- Descriptive alt attributes.
- Proper fallback behaviour.

Do not preload all project illustrations.

E. METRICS

Aim for:

- Lighthouse Performance: 90+.
- Accessibility: 95+.
- Best Practices: 95+.
- SEO: 95+.
- LCP: <= 2.5 seconds.
- CLS: <= 0.1.

INP must be treated as a real-user field metric.

Do not claim INP compliance from Lighthouse
laboratory measurements alone.

Where CrUX or RUM field data isn't available,
state that clearly.

Repeat performance tests with the same conditions
used for the baseline.

==================================================
11. TASK K — SEO AND SHARING
==================================================

Inspect:

- index.html.
- robots.txt.
- sitemap.xml.
- Canonical URLs.
- Open Graph.
- Twitter cards.
- JSON-LD.
- Favicon.
- OG image.
- Resume links.

Verify:

- Correct title.
- Correct meta description.
- Correct canonical domain.
- Correct preview image.
- No broken asset URLs.
- Correct favicon formats.
- No outdated personal data in metadata.

The website uses Vite and React.

Do not migrate to Next.js.

However, evaluate whether important portfolio
content is available in initial HTML.

The case studies should have meaningful discoverability.

If the implementation uses modal-only case studies,
consider whether appropriate prerendered pages or
another lightweight strategy is justified.

Do not falsely claim server-side rendering.

Keep structured data limited to accurate,
verifiable public information.

==================================================
12. TASK L — OWNER CONFIRMATION AUDIT
==================================================

Some facts were previously flagged for owner confirmation.

Do not silently change them.

Check:

- Education marks and CGPA.
- Script Lanes responsibilities.
- Script Lanes and Word Lane dates.
- Contact mailbox.
- Current job/internship availability.
- Project metrics.
- Public profile handles.

If the current repository still contains unresolved
owner-confirmation items:

Preserve the known source values where appropriate,
but do not make unsupported new claims.

Provide a separate owner-confirmation report.

Do not invent answers.

==================================================
13. TASK M — CLEANUP AND MAINTAINABILITY
==================================================

Review the complete source after visual refinement.

Identify:
- Unused imports.
- Dead code.
- Duplicate CSS selectors.
- Unused animations.
- Duplicate data definitions.
- Repeated navigation configuration.
- Incorrect image references.
- Unnecessary dependencies.
- Unhandled promise rejections.
- Unremoved event listeners.
- Unnecessary DOM mutations.

Remove only genuinely dead code.

Do not refactor working code without justification.

Keep reusable components understandable.

Keep data separate from presentation.

Preserve the existing architecture.

==================================================
14. FINAL RELEASE TESTING
==================================================

Run:

- npm run build.
- All available unit tests.
- All available integration tests.
- Type checking.
- ESLint.
- Browser automation.
- Responsive tests.
- Accessibility tests.

Test all important visitor journeys:

JOURNEY 1:
Open home -> Explore Work -> Open TradersDesk case study
-> Inspect architecture -> Close -> Continue browsing.

JOURNEY 2:
Open home -> QueryPilot -> Read pipeline
-> Visit GitHub -> Return.

JOURNEY 3:
Open command palette -> Find project
-> Navigate to project -> Open case study.

JOURNEY 4:
Open mobile menu -> Navigate to Experience
-> Open achievement -> Close achievement.

JOURNEY 5:
Open Contact -> Fill form -> Submit
-> Verify genuine success or honest fallback.

JOURNEY 6:
Disable external API connectivity
-> Verify coding activity fallback
-> Ensure no fabricated live statistics appear.

JOURNEY 7:
Enable reduced-motion preference
-> Verify all important content and functions remain accessible.

Do not claim any test passed without execution.

==================================================
15. FINAL SCREENSHOTS AND VISUAL SIGN-OFF
==================================================

Capture actual browser screenshots after implementation.

Produce:

DESKTOP:
- Complete 1440px portfolio.
- Hero.
- Selected Work.
- Systems.
- TradersDesk case study.
- QueryPilot case study.
- Experience.
- Coding activity.
- Achievements.
- Skills.
- Contact.

MOBILE:
- Complete 390px portfolio.
- Hero.
- Projects.
- Architecture.
- Coding activity.
- Timeline.
- Contact.

INTERACTIONS:
- Open command palette.
- Open project modal.
- Open architecture node detail.
- Open mobile menu.

Inspect all screenshots.

Provide a genuine before/after comparison.

Do not report "visual perfection" based solely
on passing automated tests.

==================================================
16. FINAL IMPLEMENTATION REPORT
==================================================

Provide a detailed final report.

A. Duplicate content eliminated.

B. Final visual improvements.

C. Project screenshot and blueprint inventory.

D. Case study improvements.

E. Typography, spacing and design-token changes.

F. Responsiveness and cross-browser results.

G. Accessibility results.

H. Performance baseline vs final results.

I. SEO and metadata audit.

J. Owner confirmation items.

K. Files created and modified.

L. Dependencies changed.

M. Actual screenshots.

N. Remaining limitations.

O. Production release checklist.

Give exact results and honest limitations.

==================================================
FINAL EXECUTION BOUNDARIES
==================================================

Implement PHASE C ONLY.

Preserve Phase A and Phase B work.

Do not add unnecessary new features.

Do not create fictional project screenshots.

Do not fabricate metrics.

Do not change educational details without confirmation.

Do not change email without confirmation.

Do not push commits.

Do not deploy.

Do not discard existing changes.

The goal is a final portfolio that feels:

- Cinematic.
- Editorial.
- Premium.
- Technically credible.
- Visually balanced.
- Fast.
- Accessible.
- Trustworthy.

Most important:

The website must remain visually excellent
even when every animation is disabled.

A recruiter should immediately see the quality
of the products I build, understand the systems
behind them, and have a clear reason to contact me.

QUALITY OVER DECORATION.
AUTHENTICITY OVER MOCKUPS.
CLARITY OVER COMPLEXITY.
ENGINEERING QUALITY OVER ANIMATION QUANTITY.
