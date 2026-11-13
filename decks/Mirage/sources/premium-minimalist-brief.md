# Frontend Redesign — Premium Minimalist Design System

Redesign the frontend of this project into a cohesive, premium, modern web application by combining the visual design languages of **Fresha, Revolut, Mercury, ZARA, and Magnific**.

The goal is not to imitate any single website, but to synthesize their strongest design characteristics into one distinctive, consistent, and production-quality interface.

## 1. Design References

Study and draw inspiration from the following references:

- **Fresha:** https://mobbin.com/apps/fresha-web-904a8869-5c54-4efc-bbad-bc7e4e32985f/be121534-b1f3-49f6-96e7-05a5ecdb2676/screens
- **Revolut:** https://mobbin.com/apps/revolut-web-538d8553-9169-4343-a90c-66494c577e23/207a7927-16eb-42dc-a110-0584ea786a10/screens
- **Mercury:** https://mobbin.com/apps/mercury-web-9f5c0a65-0bb4-4978-9af1-ecefe30b4ecb/ea8d2d44-72a0-430c-a20f-040afcc09eaa/screens
- **ZARA:** https://mobbin.com/apps/zara-web-9947d28c-185b-43c0-9efa-203dcdf461dc/0dcc8fae-4468-4d86-ba01-6bd1825826a2/screens
- **Magnific:** https://mobbin.com/apps/magnific-web-763733fa-e48f-4332-b9e0-d4adcb3d4c4e/b114d9c3-221c-409a-ace5-3704daff0759/screens

If the reference screenshots are accessible, analyze their layouts, typography, spacing, visual hierarchy, navigation patterns, surfaces, and interactions before implementation.

Do not assume inaccessible screenshots have been inspected.

## 2. Overall Visual Direction

Create a visual identity characterized by:

- Premium minimalism
- Editorial typography
- Sophisticated simplicity
- Generous whitespace
- Precise alignment and spacing
- Subtle, intentional interactions
- Refined monochromatic foundations
- Strong information hierarchy
- Calm, professional, and modern aesthetics
- Beautiful but highly functional interfaces

The result should feel like a thoughtfully designed commercial product, not a generic dashboard template.

### Design Influence

**Mercury + Revolut — Primary foundation**

Use their fintech-inspired visual clarity, structured layouts, polished controls, restrained colors, and high-quality application interfaces.

**ZARA — Typography and composition**

Introduce editorial typography, confident use of whitespace, asymmetric compositions where appropriate, and minimal visual decoration.

**Fresha — Usability and accessibility**

Incorporate approachable navigation, clear interactive elements, intuitive user flows, and comfortable spacing.

**Magnific — Creative sophistication**

Introduce subtle creative-tool aesthetics, polished previews, elegant workspace layouts, and tasteful transitions.

The entire application must share a unified visual language.

## 3. Color System

Use a predominantly neutral palette.

Suggested light theme:

- Primary background: `#FFFFFF`
- Secondary background: `#F8F8F7`
- Elevated surface: `#F3F3F1`
- Primary text: `#171717`
- Secondary text: `#717171`
- Subtle borders: `#E8E8E6`
- Primary buttons: `#171717`
- Primary button text: `#FFFFFF`

Use a single restrained accent color only when it improves interaction clarity or communicates product identity.

Avoid excessive gradients, saturated colors, decorative backgrounds, and unnecessary visual effects.

Support dark mode if the existing application requires it, using semantic design tokens rather than manually inverting colors.

## 4. Typography

Typography should be a defining feature of the design.

Use a sophisticated modern sans-serif such as Inter, Geist, or an equivalent typeface.

Apply:

- Large, confident page headings
- Clean, compact navigation labels
- Clear typography hierarchy
- Carefully controlled line heights
- Subtle letter-spacing adjustments
- Strong contrast between headings and supporting information
- Editorial-style section compositions

Use typography, whitespace, and alignment to establish hierarchy before introducing borders, shadows, or decorative elements.

Avoid unnecessarily bold text everywhere.

## 5. Layout and Spacing

Create a clean, spacious, and structured layout.

- Use a consistent 8px-based spacing system.
- Keep content widths intentional and readable.
- Provide generous spacing between major sections.
- Maintain tighter spacing within logically grouped controls.
- Use consistent horizontal alignment throughout the interface.
- Prefer subtle separators over excessive card boundaries.
- Avoid nesting cards inside multiple layers of cards.
- Allow important content to occupy sufficient visual space.

Use asymmetry selectively when it creates a stronger editorial composition without reducing usability.

The interface should feel spacious but never wasteful.

## 6. Components

### Buttons

- Minimal, refined shapes
- Clear primary, secondary, and tertiary hierarchy
- Subtle hover and pressed states
- Consistent padding and sizing
- Avoid oversized pill buttons everywhere

### Cards and Containers

- Prefer flat surfaces and gentle contrast
- Thin, subtle borders where necessary
- Minimal shadows
- Consistent corner radii
- Clear internal spacing
- Avoid excessive card-based fragmentation

### Navigation

- Clean and understated
- Strong active-state indication
- Intuitive information architecture
- Minimal visual noise
- Contextual actions positioned predictably

### Forms

- Elegant input fields
- Readable labels and helper text
- Clear focus states
- Consistent validation feedback
- Comfortable keyboard interaction

### Tables and Data Displays

- Clean typography
- Precise alignment
- Subtle row separators
- Restrained hover states
- Clear data hierarchy
- Readable numeric formatting
- Avoid unnecessarily heavy borders

### Dialogs, Menus, and Popovers

- Refined spacing
- Consistent visual hierarchy
- Smooth but restrained transitions
- Accessible keyboard and focus behavior

All components should feel like part of the same design system.

## 7. Interaction and Motion

Introduce subtle micro-interactions inspired by modern premium applications.

Examples:

- Gentle button hover transitions
- Smooth menu opening and closing
- Refined focus indicators
- Subtle content transitions
- Elegant loading skeletons
- Responsive interactive feedback

Use approximately 150–250ms transitions for common UI interactions, adjusting when appropriate.

Prioritize natural motion over flashy animation.

Respect `prefers-reduced-motion`.

Do not introduce unnecessary animations simply to make the application appear more sophisticated.

## 8. Responsive Design

Design mobile, tablet, and desktop layouts intentionally.

Do not simply shrink desktop components.

Ensure that:

- Navigation adapts appropriately
- Content hierarchy remains intact
- Tables have suitable mobile alternatives
- Touch targets remain comfortable
- Typography scales naturally
- Forms remain easy to use
- No horizontal overflow occurs unintentionally

## 9. Design Principles

Follow these principles consistently:

1. **Clarity over decoration.**
2. **Typography over unnecessary visual effects.**
3. **Whitespace over excessive containers.**
4. **Hierarchy over uniformity.**
5. **Consistency over isolated visual experiments.**
6. **Subtle sophistication over flashy aesthetics.**
7. **Usability over visual novelty.**

Avoid common generic AI-generated UI patterns:

- Excessive rounded cards
- Unnecessary glassmorphism
- Heavy gradients
- Oversized drop shadows
- Random accent colors
- Too many bordered containers
- Decorative icons without functional purpose
- Overly dense dashboards
- Inconsistent spacing or corner radii
- Generic hero sections unrelated to the product

The design must feel deliberate, recognizable, and professionally art-directed.

## 10. Implementation Instructions

First inspect the existing frontend architecture, pages, components, styling conventions, and dependencies.

Then:

1. Identify the existing visual inconsistencies and usability problems.
2. Establish reusable design tokens for typography, colors, spacing, radii, and surfaces.
3. Redesign the application shell and primary navigation.
4. Refine shared UI components.
5. Apply the design system consistently across existing pages.
6. Improve responsive behavior and interaction states.
7. Verify the visual consistency of the complete application.

Preserve existing functionality, routes, data flows, business logic, and API contracts.

Reuse the project's existing framework and styling system wherever possible.

Avoid introducing unnecessary dependencies or rewriting unrelated code.

Do not remove features merely to simplify the interface.

## 11. Quality Expectations

The final frontend should look and feel like a premium, carefully designed product ready for real users.

It should combine:

- Mercury's professional refinement
- Revolut's modern product polish
- ZARA's editorial minimalism
- Fresha's intuitive usability
- Magnific's creative sophistication

Do not create five separate styles for different pages.

Synthesize all references into **one cohesive design identity**.

Make concrete implementation changes rather than providing only design suggestions.

After implementation, review the result for visual consistency, responsiveness, accessibility, and functional regressions.

**Final objective: A beautiful, quiet, confident, premium interface that feels custom-designed rather than generated from a standard UI template.**