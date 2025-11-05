# Design Guidelines: منصة AI المتكاملة

## Design Approach
**Hybrid Modern AI Platform**: Drawing inspiration from ChatGPT's conversational interface, Linear's typography precision, and Notion's workspace flexibility. This platform prioritizes both functionality and visual elegance to create a premium Arabic AI experience.

## Core Design Principles
- **Arabic-First Design**: Full RTL support with proper Arabic typography hierarchy
- **Glassmorphism Aesthetic**: Layered transparency with backdrop blur effects for depth
- **Gradient Accents**: Strategic use of gradient overlays for visual interest
- **Spatial Breathing**: Generous whitespace to prevent information overload

## Typography System

### Font Family
- **Primary**: 'Cairo' or 'Tajawal' from Google Fonts (excellent Arabic readability)
- **Secondary**: 'Inter' for English UI elements and code
- **Monospace**: 'Fira Code' for AI output/code blocks

### Type Scale
- **Hero/Display**: text-4xl to text-5xl, font-bold (للعناوين الرئيسية)
- **Page Headers**: text-3xl, font-bold
- **Section Headers**: text-xl to text-2xl, font-semibold
- **Card Titles**: text-lg, font-bold
- **Body Text**: text-base, font-normal
- **Metadata/Labels**: text-sm, font-medium
- **Captions**: text-xs, font-normal

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16, 24** for consistency
- Tight spacing: p-2, gap-2 (compact elements)
- Standard spacing: p-4, gap-4 (cards, buttons)
- Section spacing: p-6 to p-8 (major components)
- Page padding: p-6 on mobile, p-8 on desktop
- Section gaps: space-y-6 to space-y-8

### Grid Structure
- **Dashboard**: 3-column grid on desktop (lg:grid-cols-3), 1 column mobile
- **Projects**: 3-column cards (lg:grid-cols-3), 2 on tablet (md:grid-cols-2)
- **Workspace**: 2-column split (sidebar + main area)
- **Max Width**: max-w-7xl for main container

## Component Library

### Navigation
**Top Navigation Bar**
- Height: h-16
- Glassmorphic background with backdrop-blur-md
- Logo positioned right (RTL)
- Icons: 24px (w-6 h-6)
- Padding: px-6

**Sidebar Navigation**
- Width: w-64 on desktop, collapsible to w-16 (icon-only)
- Full-height with overflow-y-auto
- Icons: 20px (w-5 h-5) with 2px stroke
- Active state: highlighted background with border accent
- Padding: p-4 for items

### Cards & Containers

**Project Cards**
- Border radius: rounded-xl (12px)
- Padding: p-6
- Border: border with 10% opacity
- Hover: lift effect with shadow-lg
- Aspect ratio for preview: aspect-video

**Dashboard Stats Cards**
- Glassmorphic container with gradient overlay
- Icon size: w-12 h-12 for primary icon
- Number display: text-3xl font-bold
- Label: text-sm

**Chat/Workspace Cards**
- Message bubbles: rounded-2xl with max-w-3xl
- User messages: aligned left (RTL)
- AI responses: full width with subtle background
- Padding: p-4 for messages

### Buttons

**Primary Actions**
- Height: h-10 to h-12
- Padding: px-6 py-2
- Rounded: rounded-lg
- Gradient background
- Shadow on hover: shadow-lg with glow effect
- Icons: w-5 h-5, positioned with gap-2

**Secondary Actions**
- Transparent with border
- Padding: px-4 py-2
- Hover: subtle background overlay

**Icon Buttons**
- Square: w-10 h-10
- Rounded: rounded-lg
- Icons: w-5 h-5 centered

### Form Elements

**Input Fields**
- Height: h-12
- Rounded: rounded-lg
- Padding: px-4
- Border with subtle opacity
- Focus: border accent with ring effect
- RTL text alignment

**Textarea (AI Input)**
- Min height: min-h-24
- Max height: max-h-96 with overflow-auto
- Padding: p-4
- Rounded: rounded-xl
- Resize: resize-none (controlled growth)

**Dropdowns/Selects**
- Height: h-12
- Full rounded: rounded-lg
- Chevron icon: w-4 h-4
- Dropdown menu: rounded-xl with backdrop-blur

### AI Model Selector
- Pill-style toggle buttons
- Grid: grid-cols-3 for three models
- Active state: gradient background with glow
- Icons: w-6 h-6 for model logos
- Padding: p-3 for each option

### Progress Indicators

**Progress Bars**
- Height: h-2
- Container: rounded-full with track background
- Fill: rounded-full with gradient
- Percentage label: text-sm positioned adjacent

**Creativity Slider**
- Track height: h-1
- Thumb: w-4 h-4 rounded-full
- Labels: text-xs at start/end
- Container padding: py-4

### Status Indicators
- Badges: px-3 py-1, rounded-full, text-xs
- Dot indicators: w-2 h-2, rounded-full
- Status text: font-medium

## Page Layouts

### Dashboard
- Header section: Full width with title + quick stats (grid-cols-4)
- Main grid: 3 columns (2 content + 1 sidebar)
- Recent activity: List with timeline connectors
- Quick actions: Vertical button stack

### Projects Page
- Header: Flex row with title left, actions right
- View toggle: Grid/List icons
- Grid view: 3 columns with hover effects
- List view: Full width cards with horizontal layout

### Workspace (AI Interface)
- Split layout: Sidebar (w-80) + Main area
- Chat container: max-w-4xl mx-auto
- Input area: Fixed bottom with backdrop-blur
- Model selector: Sticky top bar
- Output area: py-8 spacing between messages

### Project Details
- Hero section: Gradient background, h-64
- Tabs navigation: Horizontal scroll on mobile
- Content sections: Card-based with space-y-6
- Sidebar: Stats and metadata (w-80)

## Responsive Breakpoints
- Mobile: base (< 768px) - Single column, simplified nav
- Tablet: md (768px+) - 2 columns where applicable
- Desktop: lg (1024px+) - Full layout with 3+ columns
- Wide: xl (1280px+) - Max container width with side margins

## Interaction Patterns

**Hover States**
- Cards: Subtle lift (translate-y-[-4px]) with shadow enhancement
- Buttons: Brightness increase + shadow glow
- Links: Opacity reduction to 80%

**Loading States**
- Skeleton screens for cards: Animated gradient shimmer
- Spinners: 24px for buttons, 40px for page loads
- Progress bars for AI generation

**Animations** (Minimal)
- Page transitions: Fade in (200ms)
- Card hovers: Transform + shadow (150ms)
- Dropdown menus: Slide down (200ms)
- NO complex scroll animations

## Accessibility
- Focus indicators: Ring effect with 2px offset
- Keyboard navigation: Visible focus states on all interactive elements
- Icon buttons: aria-labels in Arabic
- Contrast ratios: Ensure text readability against glassmorphic backgrounds
- RTL support: Consistent across all components

## Images
**No hero images required** - This is a utility-focused AI platform where functionality takes precedence. Use gradient backgrounds and glassmorphic effects for visual interest instead.

**Icon Usage**
- Lucide React icons throughout
- 20px (w-5 h-5) for navigation and buttons
- 24px (w-6 h-6) for feature highlights
- 48px (w-12 h-12) for empty states and placeholders

**Project Previews**
- Placeholder cards with gradient backgrounds
- Icon representations (FolderOpen, Brain, etc.)
- aspect-video ratio for consistency