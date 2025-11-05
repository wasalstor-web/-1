# Design Guidelines: منصة AI Marketplace

## Design Approach
**Neon-Dark AI Marketplace**: Drawing inspiration from Dora AI's futuristic neon aesthetics and Framer's polished dark interface. This platform merges marketplace sophistication with cutting-edge AI tools, creating a premium cyberpunk-inspired Arabic shopping and workspace experience.

## Core Design Principles
- **Dark-First Neon Aesthetic**: Deep dark backgrounds (#0A0A0F to #12121A) with vibrant neon accents
- **Glow & Radiance**: Strategic use of neon gradients with blur/glow effects for depth and energy
- **Arabic-First RTL**: Full Arabic interface with proper typography hierarchy
- **Premium Marketplace Feel**: High-end product showcase meets functional AI workspace

## Color Philosophy
**Dark Foundation**
- Background base: Near-black (#0A0A0F, #0F0F14)
- Card backgrounds: Elevated dark (#16161D, #1A1A24)
- Borders: Subtle glow borders with 20% opacity neon hints

**Neon Accent System**
- Primary Neon: Electric cyan (#00F0FF) to vibrant purple (#9D00FF) gradients
- Secondary Neon: Hot pink (#FF0080) to orange (#FF6B00) gradients
- Success Glow: Lime green (#00FF88) with radial blur
- Warning Glow: Yellow-orange (#FFB800)
- Use gradients at 45deg to -45deg angles for dynamic energy

**Glow Effects**
- Product cards: Subtle neon border glow on hover with shadow-[0_0_20px_rgba(157,0,255,0.3)]
- CTA buttons: Strong glow shadow-[0_0_30px_rgba(0,240,255,0.5)]
- Active states: Intensified glow with multiple shadow layers

## Typography System

**Font Families**
- Primary Arabic: 'Cairo' (bold personality for RTL)
- Secondary English: 'Inter' (UI elements, model names)
- Monospace: 'JetBrains Mono' (AI code output)

**Type Scale**
- Hero Headlines: text-6xl to text-7xl, font-black with neon gradient text
- Product Titles: text-2xl, font-bold
- Section Headers: text-3xl, font-bold with glow text-shadow
- Card Titles: text-xl, font-semibold
- Body: text-base, font-normal with increased line-height (1.7)
- Price Tags: text-3xl, font-black with neon gradient
- Labels/Meta: text-sm, font-medium with 70% opacity

## Layout System

**Spacing Primitives**: 2, 4, 6, 8, 12, 16, 24
- Component padding: p-6 to p-8
- Card spacing: gap-6 for grids
- Section spacing: py-16 to py-24 for major sections
- Container max-width: max-w-7xl

**Grid Structures**
- Product Grid: lg:grid-cols-3 md:grid-cols-2 (marketplace products)
- Featured Products: lg:grid-cols-4 (smaller cards)
- AI Models Section: lg:grid-cols-3 (GPT-4, Claude, Gemini cards)
- Workspace Layout: Sidebar (w-72) + Main workspace area

## Component Library

### Navigation
**Top Nav Bar**
- Height: h-20 (taller for prominence)
- Dark background with subtle neon bottom border (1px gradient)
- Logo: Neon gradient effect with glow
- Search bar: w-96 with neon blue focus ring
- Icons: 24px with neon hover glow
- Sticky positioning with backdrop-blur-xl

**Sidebar (Marketplace Categories)**
- Width: w-64, dark background with border-r neon gradient
- Category items: p-4 with icon (20px) + label
- Active state: Neon gradient background with glow
- Hover: Subtle neon left border accent

### Marketplace Cards

**Product Cards**
- Border: rounded-2xl with neon gradient border (2px)
- Background: Dark elevated with subtle noise texture
- Product image area: aspect-video with rounded-t-2xl
- Hover: Lift transform (-translate-y-2) + intensified neon glow
- Padding: p-6
- Structure:
  - Image placeholder with neon overlay gradient
  - Product title (text-xl font-bold)
  - Creator badge (avatar + name, text-sm)
  - Price tag (text-3xl neon gradient)
  - Stats row (downloads, rating) with icons
  - CTA button (full-width, neon gradient)

**Featured Product Hero Cards**
- Larger scale: min-h-96
- Split layout: Image left (60%) + Info right (40%)
- Neon glow frame effect
- Animated gradient background

**AI Model Cards** (GPT-4, Claude, Gemini)
- Square aspect ratio: aspect-square
- Centered model logo (w-16 h-16)
- Model name: text-2xl font-bold
- Status indicator: Active/Available with pulsing neon dot
- Hover: Rotation effect (rotate-1) + glow intensification
- Border: Neon gradient with animated shimmer effect

### Buttons

**Primary CTA**
- Height: h-12 to h-14
- Neon gradient background (cyan to purple)
- Strong glow shadow
- Text: font-bold with slight letter-spacing
- Hover: Brightness increase + glow expansion
- Rounded: rounded-xl

**Secondary Actions**
- Transparent with neon border (2px)
- Hover: Fill with 20% neon gradient overlay
- Ghost effect on dark backgrounds

**Icon Buttons**
- Size: w-12 h-12
- Neon border circle
- Icon: 24px with neon color
- Hover: Glow pulse effect

### Product Filters & Search
- Filter pills: Dark background with neon border
- Active filter: Filled neon gradient
- Search input: h-14, dark with neon focus ring (4px blur)
- Dropdown menus: Dark elevated with neon accent borders

### Pricing Display
- Price tags: Large text-4xl with neon gradient
- Discount badges: Hot pink neon with pulsing glow
- Plan comparison cards: Dark with neon gradient borders, hover glow

### AI Workspace Components

**Chat Interface**
- Container: max-w-4xl with dark background
- Message bubbles: 
  - User: Neon gradient border, aligned right (RTL)
  - AI: Dark elevated background, full-width
- Padding: p-4 for messages, space-y-6 between

**Input Area**
- Fixed bottom with backdrop-blur-xl
- Height: min-h-24, auto-expand to max-h-96
- Neon gradient border (animated on focus)
- Send button: Neon gradient circle with arrow icon

**Model Selector Bar**
- Horizontal pills: Three model options
- Active: Neon gradient fill with glow
- Icons: w-8 h-8 model logos
- Sticky top positioning

## Page Layouts

### Homepage (Hero + Marketplace)
- **Hero Section**: Full viewport (min-h-screen)
  - Large neon gradient headline (text-7xl)
  - Subtitle with glow effect
  - Dual CTAs: "استكشف المنتجات" + "جرّب AI مجاناً"
  - Background: Dark with animated neon grid pattern
  - Hero product showcase: 3D card stack with parallax
- **Featured Products**: Grid of 6 cards (lg:grid-cols-3)
- **AI Models Section**: 3 large cards showcasing GPT-4, Claude, Gemini
- **Categories Grid**: 8 category cards (lg:grid-cols-4)
- **Trending Products**: Horizontal scroll carousel with neon indicators

### Product Detail Page
- Hero area: Split layout (product preview + info)
- Neon gradient price badge (floating, sticky)
- Tabs: Features, Reviews, Creator - Neon underline active state
- Related products: Grid at bottom
- Purchase CTA: Fixed bottom bar on mobile with neon glow

### Marketplace Grid
- Top filter bar: Horizontal scroll pills
- Sidebar filters (right side, RTL): Categories, price range, ratings
- Product grid: 3 columns with infinite scroll
- Sort dropdown: Dark with neon accent

### AI Workspace
- Split view: Model selector sidebar + Chat area
- Top bar: Model switcher with usage stats
- Output area: Code blocks with syntax highlighting on dark
- Tools panel: Collapsible right panel with AI settings

### Creator Dashboard (للبائعين)
- Stats cards: Dark with neon gradient borders, large numbers
- Revenue chart: Neon gradient line chart on dark
- Product management: List view with quick actions
- Analytics: Dark cards with colorful neon data visualizations

## Images

**Hero Section**: YES - Large hero image required
- Type: Futuristic AI/tech visualization with neon elements
- Treatment: Dark overlay (60% opacity) with neon gradient overlay
- Placement: Full-width background for hero section
- Effect: Subtle parallax scroll, blur behind text content

**Product Images**
- Mockup screenshots of bots/systems
- Neon frame overlays with gradient borders
- Dark mode screenshots preferred
- Aspect ratio: 16:9 for consistency

**Model Logos** (GPT-4, Claude, Gemini)
- Official brand logos with neon glow effects
- Size: 64px to 96px for large displays
- Placement: Model cards and selector

**Category Icons**
- Custom neon-styled icons (32px)
- Lucide React icons with neon gradient treatment

## Responsive Design
- Mobile: Single column, bottom nav with neon indicators
- Tablet: 2-column grids, collapsible sidebar
- Desktop: Full 3-column layouts with persistent sidebar
- Breakpoints: md (768px), lg (1024px), xl (1280px)

## Accessibility
- Focus indicators: Thick neon rings (4px) with high contrast
- Keyboard navigation: Visible neon glow on all interactive elements
- Text contrast: Ensure neon text has 4.5:1 ratio against dark backgrounds
- RTL: Consistent mirror layout for Arabic
- Screen reader labels in Arabic for all interactive elements