# منصة AI المتكاملة - Integrated AI Platform

## Overview

This is a comprehensive Arabic-first AI platform that integrates multiple leading AI models (GPT-4, Claude, Gemini) into a unified workspace. The platform provides project management capabilities, conversational AI interfaces, and a modern glassmorphic design with full RTL (right-to-left) support for Arabic users.

The application enables users to:
- Create and manage AI-powered projects
- Interact with multiple AI models through a chat interface
- Organize conversations and track project progress
- Export and analyze AI-generated content
- Customize AI creativity levels and model preferences

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Arabic-first design with RTL layout support using `dir="rtl"` on HTML root
- Custom color system with glassmorphic effects (backdrop-blur, gradients)
- Theme system supporting dark/light modes via ThemeProvider context

**Design Patterns**
- Component composition with clearly separated presentational and container components
- Custom hooks for shared logic (useIsMobile, useToast, useTheme)
- Path aliases (@/, @shared/, @assets/) for clean imports
- Responsive design using Tailwind breakpoints (mobile-first approach)

**Key Frontend Features**
- Dashboard with statistics and quick actions
- Project management with grid/list views and filtering
- Workspace with AI chat interface and streaming responses
- Model selector for choosing between GPT-4, Claude, and Gemini
- Creativity slider for adjusting AI response temperature
- Settings page for user preferences

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript with ES modules (type: "module")
- Custom middleware for request logging and JSON body parsing

**API Design**
- RESTful API endpoints under `/api` prefix
- Resource-based routes for projects and conversations
- Streaming support for AI chat responses
- Error handling with appropriate HTTP status codes

**Storage Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via @neondatabase/serverless)
- In-memory storage implementation (MemStorage) for development/testing
- Schema-driven design with Zod validation

**Database Schema**
- `users`: User accounts with username/password authentication
- `projects`: Project metadata including name, description, status, progress, AI model preference
- `conversations`: Chat history linked to projects, storing messages as JSON text

**Development vs Production**
- Vite middleware integration for HMR in development
- Static file serving in production from dist/public
- Environment-based configuration (NODE_ENV)

### AI Integration Architecture

**Multi-Model Support**
- OpenAI SDK for GPT-4 integration
- Anthropic SDK for Claude integration  
- Google Generative AI SDK for Gemini integration
- Conditional initialization based on API key availability
- Unified chat interface abstracting model differences

**Chat API Design**
- Streaming endpoints for real-time AI responses
- Model selection per conversation
- Creativity/temperature parameter support
- Conversation history management
- Error handling for missing API keys or failed requests

**Message Format**
- Standardized message structure with role (user/assistant) and content
- Timestamp tracking for chat history
- JSON serialization for database storage

### Authentication & Session Management

**Current Implementation**
- User schema defined but authentication not fully implemented
- Session support prepared via connect-pg-simple package
- Password storage structure defined (hashing implementation needed)

**Planned Architecture**
- Session-based authentication using PostgreSQL session store
- Password hashing before storage
- Protected routes requiring authentication
- User-specific project and conversation isolation

## External Dependencies

### AI Service Providers

**OpenAI (GPT-4)**
- Package: `openai`
- Configuration: `OPENAI_API_KEY` environment variable
- Used for: GPT-4 model interactions in chat workspace

**Anthropic (Claude)**
- Package: `@anthropic-ai/sdk`
- Configuration: `ANTHROPIC_API_KEY` environment variable  
- Used for: Claude model interactions in chat workspace

**Google (Gemini)**
- Packages: `@google/generative-ai`, `@google/genai`
- Configuration: `GEMINI_API_KEY` environment variable
- Used for: Gemini model interactions in chat workspace

### Database

**Neon (PostgreSQL)**
- Package: `@neondatabase/serverless`
- Configuration: `DATABASE_URL` environment variable
- Features: Serverless PostgreSQL with connection pooling
- Migration tool: Drizzle Kit with migrations stored in `/migrations`

### UI Component Libraries

**Radix UI**
- Extensive set of unstyled, accessible primitives
- Components: Dialog, Dropdown Menu, Popover, Tabs, Toast, Slider, Select, and more
- Provides keyboard navigation and ARIA support out of the box

**shadcn/ui**
- Pre-styled components built on Radix UI
- Customizable through Tailwind CSS
- Configuration in `components.json` with New York style variant

### Fonts

**Google Fonts**
- Cairo & Tajawal: Primary Arabic fonts for UI
- Inter: Secondary font for English UI elements
- Fira Code: Monospace font for code blocks and AI output

### Development Tools

**Replit-Specific**
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Code navigation
- `@replit/vite-plugin-dev-banner`: Development environment banner

**Build & Development**
- esbuild: Server-side bundling for production
- tsx: TypeScript execution for development server
- Vite HMR: Hot module replacement during development

### Styling & Utilities

**Tailwind CSS**
- Utility-first CSS framework
- Custom configuration with Arabic-optimized spacing and RTL support
- PostCSS with Autoprefixer for browser compatibility

**Additional Utilities**
- clsx & tailwind-merge: Conditional class name composition
- class-variance-authority: Variant-based component styling
- date-fns: Date formatting and manipulation