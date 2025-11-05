# منصة مبسط AI - Mubsat AI Platform

## Overview

**Mubsat AI Platform (منصة مبسط AI)** is an enterprise B2B SaaS platform combining a **Client Interface** and **Admin Panel**:

### Client Interface (B2B SaaS)
A professional, enterprise-grade **interactive website** for businesses to discover and purchase AI solutions:
- **Homepage**: Interactive Hero section with Framer Motion animations, solutions showcase with hover effects, featured products from database, API integrations, animated dashboard preview, pricing, validated contact form
- **Interactive Features**: Smooth fade-in/scale-in animations, hover effects on cards and stats, animated Sparkles icon, scroll-triggered animations
- **Database Integration**: Featured products section dynamically loads from PostgreSQL database (products table) via `/api/products?featured=true`
- **Solutions Page**: Detailed AI automation, analytics, and integration solutions
- **Pricing Page**: Three-tier pricing plans (Starter, Professional, Enterprise)
- **Contact Page**: Sales inquiry and demo request forms with full validation
- **Design Inspiration**: Zebra Technologies (clean, corporate, industrial blue) + Buraq.ai (structured layouts, elevated cards)
- **Navigation**: Seamless routing between client interface (`/`) and admin panel (`/admin`), "Get Started" buttons link to marketplace

### Admin Panel (Internal Management)
A comprehensive Arabic-first AI **Marketplace + Developer Platform** that combines five core features:

-   **AI Marketplace**: Allows users to browse and purchase pre-built AI systems (chatbots, content generators, data analyzers).
-   **AI Developer Assistant**: Provides full-featured AI chat for coding help, debugging, and development support, with an Arabic-first interface and RTL support.
-   **AI Workspace**: Enables direct interaction with multiple AI models (GPT-4, Claude, Gemini, Hugging Face models) for creating and managing AI-powered projects, saving conversations, and customizing AI creativity levels.
-   **Design Studio (Image Generator)**: Offers comprehensive multimodal AI capabilities including image generation (DALL-E 3), logo creation, and brand identity generation.
-   **Intelligent Assistant**: An advanced multi-layered AI system that analyzes intent, delegates to specialized models, executes commands, and connects to VPS servers automatically for task execution, including natural language server control and self-improvement capabilities.

The platform's ambition is to provide a fully functional, integrated AI development and consumption experience with intelligent automation capabilities, including the ability to generate deployable AI agents (ABI) for various hosting environments.

### AI Executive Agent vMax (November 5, 2025)
A comprehensive orchestration system combining multiple specialized sub-agents to provide autonomous platform management:

**Core Components:**
- **AI Executive Orchestrator**: Central coordinator that analyzes user commands, creates execution plans, assesses risks, manages approvals, and orchestrates sub-agents
- **Architect Agent**: Analyzes architecture, provides recommendations, reviews changes, assesses scalability
- **Builder Agent**: Executes code changes, builds projects, runs tests, deploys applications with canary deployment support
- **Guardian Agent**: Security scanning, PII detection/masking, prompt injection prevention, SQL injection detection, XSS prevention, integrity verification
- **Doctor AI**: System monitoring, health checks, anomaly detection, auto-healing (already existed, now integrated)
- **Memory Agent**: Long-term memory storage, user context management, preference learning, pattern recognition, conversation summarization

**Key Features:**
- Decision Log with immutable audit trail (SHA-256 hashing)
- Automatic approval gates for high-risk operations
- Cost estimation and tracking
- Canary deployment with automatic rollback
- Comprehensive security validation
- Contextual memory across sessions

**API Surface:**
- `/api/executive/command` - Submit commands for planning
- `/api/executive/approve` - Approve and execute plans
- `/api/executive/execute` - Direct execution for low-risk operations
- `/api/executive/decision-log` - Audit trail access
- `/api/executive/status` - System status and health

## Recent Changes (November 5, 2025)

### AI Executive Agent vMax - Fully Implemented 🚀
- **AI Executive Orchestrator**: Unified coordinator managing all sub-agents and operations
- **Sub-Agent System** (5 specialized agents):
  - **Architect Agent**: Architecture design, code review, risk assessment, scalability analysis
  - **Builder Agent**: Code execution, building, testing, deployment, canary deployment
  - **Guardian Agent**: Security scanning, PII detection/masking, prompt injection prevention, integrity verification
  - **Doctor AI** (existing): System monitoring, health checks, auto-healing
  - **Memory Agent**: Long-term memory, user context, preferences, learned patterns, conversation summarization
- **Decision Log & Audit Trail**: Immutable database-backed decision logging with SHA-256 integrity hashing
- **Database Integration**: New tables (executive_commands, execution_plans, decision_log, agent_memories)
- **API Endpoints**: Full REST API at `/api/executive/*` for command processing, approval, execution, and monitoring
- **System Features**:
  - Intent analysis and execution planning
  - Automatic approval gating for high-risk operations (cost >500 SAR, security changes, production deployments)
  - Risk assessment and mitigation recommendations
  - Canary deployment with automatic rollback on failure
  - Security scanning with PII masking and prompt injection detection
  - Long-term contextual memory with importance scoring
  - Cost estimation and tracking

## Recent Changes (November 5, 2025 - Earlier)

### Critical Routing Fix
- **Issue**: Nested routing patterns causing 404 errors on `/admin` and `/admin/*` paths
- **Solution**: Restructured entire routing architecture from nested `AdminRouter` with `Switch` to flat, explicit route definitions
- **Implementation**: 
  - Removed nested `/admin/:rest*` pattern that didn't match `/admin` exactly
  - Created `AdminLayout` wrapper component for consistent sidebar/header layout
  - All admin routes now explicitly defined in main `Switch` with `AdminLayout` wrapper
  - Each route matches exactly: `/admin`, `/admin/ai-brain`, `/admin/bot-registry`, etc.
- **Result**: ✅ All routes working perfectly, comprehensive e2e tests passing

### Platform Status: Production Ready 🚀
- **All Core Systems Operational**:
  - ✅ AI Brain (routing, analytics, health monitoring)
  - ✅ Doctor AI (system monitoring, recommendations)
  - ✅ Bot Registry (templates CRUD operations)
  - ✅ All Admin Dashboards accessible
  - ✅ Sidebar navigation functional
  - ✅ All API endpoints responding correctly

### Technical Improvements
- Fixed 23+ TypeScript errors (Map iteration, type assertions)
- Resolved all LSP diagnostics
- Bot templates successfully loaded into database
- Doctor AI actively monitoring (5-minute intervals)
- All E2E tests passing (Homepage, Admin pages, APIs, Navigation)

## User Preferences

Preferred communication style: Simple, everyday language.

## SmartOps Extension - Integrated Deployment Directive

**Directive: Integrated SmartOps Extension**

Starting with this update, the assistant has additional executive permissions within the same current environment without changing the interface or conversation style.

When receiving any file from the user (regardless of extension), the assistant automatically:

1. **Analyzes** the file type and determines if it's a web project, individual file, or compressed package
2. **Uploads** the file automatically to the specified server using secure protocol (SFTP/SSH) via pre-registered connection credentials
3. **Deploys** files to the appropriate path (`/var/www/<project_name>/`) and runs or reloads necessary services (such as Nginx, Node, or PHP-FPM)
4. **Analyzes logs** immediately after upload to detect errors and operational issues
5. **Handles errors** automatically via intelligent debugging models, then retries if necessary
6. **Generates a final report** showing:
   - Upload status (success/failed/fixed)
   - Errors that were handled
   - Execution time
   - Final URL if available
7. **Interacts naturally** within the same conversation interface, without showing new tools or additional screens

**Deployment Target Server:**
- IP: 46.202.159.100
- User: root
- App Directory: /var/www/mubsat-ai
- Auto-deploy on file upload or explicit request

## System Architecture

### Frontend Architecture

The frontend is built with React 18+ and TypeScript, using Vite for development and bundling. Wouter handles routing, and TanStack Query manages server state. UI components are built using `shadcn/ui` based on Radix UI primitives, styled with Tailwind CSS, supporting an Arabic-first design with RTL layout and a Neon/Dark theme. Design patterns emphasize component composition, custom hooks, and a mobile-first responsive approach. Key features include a Marketplace, Dashboard, AI Developer Assistant, Image Generator Studio, Intelligent Assistant interface, Projects & Workspace, and Settings.

### Backend Architecture

The backend utilizes Express.js with TypeScript, providing RESTful API endpoints for resources like projects and conversations, with streaming support for AI chat. Drizzle ORM is used for type-safe database operations with PostgreSQL (Neon), and an in-memory storage option is available for development. The database schema includes tables for `users`, `projects`, `conversations`, `aiConversations`, `aiMessages`, `servers`, and `server_commands`. Authentication is planned with session management and bcrypt for password hashing.

### AI Integration Architecture

The platform supports multiple AI models: OpenAI (GPT-4, GPT-4 Mini, DALL-E 3, GPT-4 Vision, Whisper), Anthropic (Claude 3.5 Sonnet), Google Generative AI (Gemini 2.0 Flash), and Hugging Face (Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1). A unified chat interface abstracts model differences, offering streaming responses, model selection per conversation, and creativity/temperature parameter control. The Intelligent Assistant includes an `IntentAnalyzer` to interpret user commands, a `VPS Executor` for remote server interaction via SSH, and a `Self-Improvement Engine`. It also features an `ABI (Agent Binary Interface) Generator` for creating deployable AI agents.

### Multimodal AI Capabilities

The platform integrates advanced multimodal AI features:
-   **Image Generation (DALL-E 3)**: For high-quality image, logo, and brand identity creation.
-   **Vision Analysis (GPT-4 Vision)**: For analyzing and describing images.
-   **Speech-to-Text (Whisper)**: For converting audio to text with Arabic support.

### System Design Choices

-   **Arabic-First & RTL Support**: The platform prioritizes an Arabic-first design with full RTL layout support.
-   **Neon/Dark Theme**: A consistent dark theme with neon accents is applied throughout.
-   **Multi-Model AI Support**: Comprehensive integration and dynamic selection of 8 AI models.
-   **AI Developer Assistant**: A dedicated full-screen chat for coding assistance with syntax highlighting and templates.
-   **Telegram Bot Integration**: A full-featured Telegram bot with multi-model AI, image/logo generation, and intelligent assistant capabilities including VPS command execution.
-   **SSH Remote Server Management**: Full SSH integration for remote VPS server control, supporting both SSH keys and password authentication, and logging all commands.
-   **Production-Ready Storage**: Automatic switching between PostgreSQL (Neon) and in-memory storage based on environment.
-   **Intelligent Assistant System**: Multi-layered AI architecture with intent analysis, smart delegation, execution planning, and a suggestions system, fully integrated with VPS servers and the Telegram bot.
-   **ABI Generator**: Enables generation of standalone AI agent packages (`ai-agent.js` and `package.json`) for deployment on various hosting environments, with API key authentication and command whitelisting for security.

## External Dependencies

### AI Service Providers

-   **OpenAI**: For GPT-4 models, DALL-E 3, GPT-4 Vision, and Whisper.
-   **Anthropic**: For Claude models.
-   **Google Generative AI**: For Gemini models.
-   **Hugging Face**: For open-source models (Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1).

### Database

-   **Neon (PostgreSQL)**: Serverless PostgreSQL for persistent data storage, integrated via `@neondatabase/serverless` and Drizzle ORM.

### UI Component Libraries

-   **Radix UI**: Provides unstyled, accessible UI primitives.
-   **shadcn/ui**: Pre-styled components built on Radix UI.

### Fonts

-   **Google Fonts**: Cairo & Tajawal for Arabic, Inter for English, Fira Code for code blocks.

### Styling & Utilities

-   **Tailwind CSS**: Utility-first CSS framework with custom configuration for Arabic and RTL support.
-   **clsx & tailwind-merge**: For conditional class name composition.
-   **class-variance-authority**: For variant-based component styling.
-   **date-fns**: For date manipulation.