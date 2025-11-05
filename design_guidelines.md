# Design Guidelines: Mubsat AI Platform (منصة مبسط AI)

## Design Approach
**Enterprise B2B SaaS Platform**: Inspired by Zebra Technologies' industrial professionalism and Buraq.ai's structured layout system. Clean, corporate aesthetic combining enterprise trust signals with modern SaaS sophistication for B2B AI solutions.

## Core Design Principles
- **Clean Corporate Aesthetic**: White/light gray foundations with industrial blue accents
- **Enterprise Trust**: Professional, reliable visual language with clear hierarchy
- **Elevated Surfaces**: Card-based layouts with soft shadows for depth
- **Structured Clarity**: Three-column grid systems for content organization

## Typography System

**Font Families**
- Primary: 'Inter' (headings, UI)
- Secondary: 'DM Sans' (body text)
- Monospace: 'JetBrains Mono' (API code examples)

**Type Scale**
- Hero Headlines: text-6xl, font-bold
- Section Headers: text-4xl, font-bold
- Subsection Headers: text-3xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body: text-base, font-normal, leading-relaxed (1.75)
- Small Text/Labels: text-sm, font-medium
- API Documentation: text-sm, font-mono

## Layout System

**Spacing Primitives**: 4, 6, 8, 12, 16, 24
- Card padding: p-8
- Section spacing: py-24 for major sections, py-16 for subsections
- Grid gaps: gap-8 for cards, gap-6 for list items
- Container: max-w-7xl

**Grid Structures**
- Three-column layouts: lg:grid-cols-3 (Solutions, Products, Features)
- Two-column splits: lg:grid-cols-2 (Benefits, Comparisons)
- API Grid: lg:grid-cols-4 (Integration logos)
- Dashboard preview: Single large viewport

## Component Library

### Navigation
**Top Nav**
- Height: h-20
- Sticky with subtle bottom border
- Logo left, nav center, CTA right
- Link spacing: gap-8, text-sm font-medium
- CTA button: Industrial blue, h-11 px-6 rounded-lg

### Hero Section
**Layout**: Full viewport (min-h-screen)
- Split layout: Text content (50%) + Hero Image (50%)
- Large headline: text-6xl font-bold with tight leading
- Subtitle: text-xl, max-w-2xl, leading-relaxed
- Dual CTAs: Primary (blue) + Secondary (outline)
- Stats row: 4 metrics (grid-cols-4) below CTAs with large numbers
- **Hero Image**: Required - Enterprise dashboard/AI visualization on right side

### Cards

**Solution Cards**
- Rounded: rounded-2xl
- Padding: p-8
- Shadow: Soft elevation (shadow-lg)
- Icon area: w-14 h-14, rounded-xl with blue background
- Title: text-xl font-semibold
- Description: text-base, 3-line max
- Link: "Learn More" with arrow, text-sm font-medium
- Hover: Subtle lift (transform -translate-y-1), shadow intensification

**Product Cards**
- Structure: Image top (aspect-video) + Content below
- Border: 1px subtle border
- Badge: Top-right corner for "Enterprise" or "Popular"
- Title: text-2xl font-bold
- Feature list: 4-5 items with checkmark icons (16px)
- Price display: text-3xl font-bold
- CTA: Full-width button at bottom

**API Integration Cards**
- Square: aspect-square
- Centered logo: w-20 h-20 grayscale, full-color on hover
- Provider name: text-sm font-medium below logo
- Grid: lg:grid-cols-4 md:grid-cols-3

### Dashboard Preview Section
**Layout**: Full-width with max-w-7xl container
- Large screenshot: rounded-2xl with shadow-2xl
- Browser chrome mockup: Top bar with dots
- Caption: Below image with feature highlights
- Image: Dashboard UI showing AI analytics, graphs, data tables

### Pricing Section
**Structure**: Three pricing tiers (lg:grid-cols-3)
- Card elevation hierarchy: Middle card (Popular) elevated higher
- Plan name: text-2xl font-bold
- Price: text-5xl font-bold with /month text-sm
- Feature list: Checkmarks (16px icons) + text-sm
- CTA: Full-width, h-12 rounded-lg
- "Contact Sales" for Enterprise tier

### Forms

**Contact Form**
- Two-column split: Form (60%) + Contact info (40%)
- Input height: h-12
- Textarea: min-h-32
- Labels: text-sm font-medium, mb-2
- Focus states: Blue ring (ring-2)
- Submit button: h-12, full-width on mobile

### Buttons

**Primary**
- Height: h-11 to h-12
- Padding: px-6 to px-8
- Rounded: rounded-lg
- Font: font-semibold text-base
- Hover: Slight scale (scale-105) + shadow increase

**Secondary**
- Transparent with 2px border
- Same sizing as primary
- Hover: Background fill with 10% opacity

**Icon Buttons**
- Size: w-10 h-10
- Rounded: rounded-lg
- Icon: 20px from Lucide React

## Page Layout Structure

### Homepage Sections (in order)
1. **Hero**: Full viewport split with large image, dual CTAs
2. **Trust Bar**: Client logos (grayscale), horizontal scroll on mobile
3. **Solutions**: Three-column cards (AI Automation, Analytics, Integration)
4. **Products**: Two-column feature blocks alternating image/text
5. **API Integrations**: Four-column grid of integration logos
6. **Dashboard Preview**: Large centered screenshot with feature callouts
7. **Pricing**: Three-tier comparison table
8. **Contact/Demo**: Two-column form + info section

### Supporting Pages
- **Solutions Detail**: Hero + 3-column features + CTA
- **Pricing**: Comparison table + FAQ accordion
- **API Docs**: Sidebar navigation + code examples
- **About**: Timeline layout + team grid

## Images

**Required Images**:
- **Hero Image**: YES - Large hero required
  - Type: Modern dashboard/AI interface visualization
  - Placement: Right 50% of hero split layout
  - Treatment: High-quality screenshot with subtle shadow
  
- **Product Screenshots**: Dashboard interfaces, analytics views
- **Integration Logos**: Partner/API provider logos (grayscale default)
- **Client Logos**: Trust bar at top of page
- **Dashboard Preview**: Full-width centered large screenshot

## Responsive Behavior
- Desktop: Three-column grids, split layouts
- Tablet (md): Two columns, stacked hero
- Mobile: Single column, full-width cards, horizontal scroll for logos
- Container padding: px-6 md:px-8 lg:px-12

## Accessibility
- Focus rings: 2px blue rings on all interactive elements
- Button contrast: Minimum 4.5:1 ratio
- Skip links for keyboard navigation
- All icons paired with labels
- Semantic HTML structure