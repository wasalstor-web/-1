# منصة AI المتكاملة - Integrated AI Platform

## Recent Updates (November 5, 2025)

### 🖥️ **SSH Remote Server Management (NEW!)**
Complete SSH integration for remote VPS server control:

#### SSH Executor
- **Full SSH Support**: Execute commands on remote servers via SSH protocol
- **Dual Authentication**: Supports both SSH keys and password authentication
- **Security**: 30-second timeout protection, comprehensive error handling
- **Real-time Execution**: Direct command execution with instant results
- **Command Logging**: All commands logged in `server_commands` table

#### Telegram Bot Integration
- **`/execute` command**: Execute any command on VPS directly from Telegram
- **Live Results**: Instant feedback with exit codes and output
- **Arabic Interface**: Full Arabic support with clear status messages
- **Multi-Server Support**: Automatic detection of active SSH-enabled servers

#### API Endpoints
- `POST /api/servers/:id/execute` - Execute command via SSH
- `POST /api/servers/:id/test` - Test SSH connection
- `GET /api/servers` - List all registered servers
- `POST /api/servers` - Register new server

#### Database Schema
- Extended `servers` table with SSH fields:
  - `ssh_enabled`, `ssh_host`, `ssh_port`, `ssh_username`
  - `ssh_password`, `ssh_private_key`
- `server_commands` table for command history and audit trail

#### Real Production Server
- **Current Server**: `srv973932.hstgr.cloud` (46.202.159.100)
- **Status**: ✅ Fully Connected via SSH
- **Uptime**: 7+ days
- **Resources**: 199GB storage (49% used), 7.7GB RAM
- **OS**: Linux 5.14.0-570.46.1.el9_6.x86_64

#### Example Usage
```bash
# Via Telegram Bot:
/execute hostname          # → srv973932.hstgr.cloud
/execute uptime           # → 7 days, 1:08
/execute df -h            # → Disk space info
/execute ps aux | head -10 # → Running processes

# Via API:
curl -X POST /api/servers/:id/execute \
  -d '{"command": "hostname"}'
→ {"success": true, "output": "srv973932.hstgr.cloud\n", "exitCode": 0}
```

### 🧠 Advanced Intelligent Assistant System
The Intelligent Assistant has been significantly enhanced with powerful new capabilities:

#### Self-Improvement Engine
- AI can now improve itself when requested
- Supports commands like "طور نفسك", "أضف ميزة", "حسن نفسك"
- Analyzes improvement requests and generates proposed code changes
- Requires user approval before implementing improvements
- Tracks improvement history for auditability

#### ABI (Agent Binary Interface) Generator
- **What is ABI?**: A unified, standalone AI agent that can be deployed on any VPS or Hostinger
- **Features**:
  - Generates complete `ai-agent.js` and `package.json` files
  - Supports VPS, Hostinger, and Shared Hosting deployment
  - Includes platform-specific installation instructions
  - HTTP API for command execution
  - Health check endpoint for monitoring
- **Usage**: Say "اعطني ABI لسيرفر VPS-1" or use the "إنشاء ABI" button in the UI
- **Deployment**: Complete guide available in `ABI_DEPLOYMENT_GUIDE.md`

#### Enhanced Features
- **Deeper Intent Analysis**: Better understanding of user commands with automatic delegation to more powerful models
- **VPS Integration**: Automatically routes commands to appropriate servers
- **Execution Planning**: Generates step-by-step plans for complex tasks
- **Smart Suggestions**: Context-aware follow-up suggestions

#### Frontend Improvements
- New ABI Generator dialog with visual file management
- Download functionality for generated files
- Platform-specific installation step display
- Real-time generation progress feedback

#### API Additions
- `POST /api/intelligent-assistant/generate-abi` - Generate ABI package
- `GET /api/intelligent-assistant/download-abi/:serverName` - Download specific ABI file

#### Bug Fixes & Security Improvements
- Fixed `apiRequest` parameter ordering in IntelligentAssistant.tsx
- Resolved fetch API call issues
- **Critical Fix**: Fixed userId persistence using useRef + localStorage for conversation continuity
- **Security Fix**: Implemented comprehensive ABI security:
  - API Key authentication (required Authorization header)
  - Command whitelisting (18 safe commands only)
  - Input sanitization (blocks dangerous characters)
  - Timeout protection (30s max execution)
  - Output size limits (1MB max)
  - Removed public `/api-key` endpoint (key only shown in console on startup)

## Overview

This is a comprehensive Arabic-first AI **Marketplace + Developer Platform** that combines five core features:

-   **AI Marketplace**: Shop for ready-made AI systems (chatbots, content generators, data analyzers). It allows users to browse 6+ pre-built AI products across 4 categories, view featured products, filter by category, and purchase AI systems.
-   **AI Developer Assistant**: Full-featured AI chat for coding help, debugging, and development support, with an Arabic-first interface and RTL support.
-   **AI Workspace**: Direct interaction with GPT-4, Claude, and Gemini models, enabling users to create and manage AI-powered projects, save conversations, and customize AI creativity levels.
-   **Design Studio (Image Generator)**: Comprehensive multimodal AI capabilities including image generation (DALL-E 3), logo creation, brand identity generation, with download and preview features.
-   **Intelligent Assistant**: Advanced multi-layered AI system that analyzes intent, delegates to specialized models, executes commands, and connects to VPS servers automatically for task execution.

The platform's ambition is to provide a fully functional, integrated AI development and consumption experience with intelligent automation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18+ and TypeScript, using Vite for development and bundling. Wouter handles routing, and TanStack Query manages server state. UI components are built using `shadcn/ui` based on Radix UI primitives, styled with Tailwind CSS, supporting an Arabic-first design with RTL layout and a Neon/Dark theme. Design patterns include component composition, custom hooks, and a mobile-first responsive approach. Key features include:
- **Marketplace**: Browse and purchase AI products
- **Dashboard**: Main hub and overview
- **AI Developer Assistant**: Full-screen coding chat interface
- **Image Generator Studio**: Comprehensive design studio for generating images, logos, and brand identities with DALL-E 3
- **Intelligent Assistant**: Multi-layered AI chat with intent analysis, execution plans, VPS integration, and smart suggestions
- **Projects & Workspace**: AI-powered project management with multi-model chat
- **Settings**: User preferences and configuration

### Backend Architecture

The backend utilizes Express.js with TypeScript, providing RESTful API endpoints for resources like projects and conversations, with streaming support for AI chat. Drizzle ORM is used for type-safe database operations with PostgreSQL (Neon), and an in-memory storage option is available for development. The database schema includes tables for `users`, `projects`, `conversations`, `aiConversations`, and `aiMessages`. Authentication is planned with session management and bcrypt for password hashing.

### AI Integration Architecture

The platform supports multiple AI models: OpenAI (GPT-4, GPT-4 Mini), Anthropic (Claude 3.5 Sonnet), Google Generative AI (Gemini 2.0 Flash), and Hugging Face (Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1), integrated via their respective SDKs. A unified chat interface abstracts model differences, offering streaming responses, model selection per conversation, and creativity/temperature parameter control. Messages adhere to a standardized format with role and content.

### Multimodal AI Capabilities (NEW)

The platform now includes advanced multimodal AI features powered by OpenAI:

-   **Image Generation (DALL-E 3)**: Generate high-quality images and illustrations with customizable size, quality, and style parameters.
-   **Vision Analysis (GPT-4 Vision)**: Analyze and describe images with detailed AI-powered insights.
-   **Speech-to-Text (Whisper)**: Convert audio to text with full Arabic language support.
-   **Logo Generator**: Create professional business logos based on business name, industry, and style preferences.
-   **Brand Identity Generator**: Generate complete brand identity packages including logo descriptions, color palettes, font recommendations, visual style guidelines, and application suggestions.

### System Design Choices

-   **Arabic-First & RTL Support**: The entire platform is designed with an Arabic-first approach, including full RTL support across the UI.
-   **Neon/Dark Theme**: A consistent Neon/Dark theme is applied across the application, featuring deep dark backgrounds and cyan-to-purple gradients, inspired by Dora AI and Framer.
-   **Multi-Model AI Support**: Comprehensive integration of 8 AI models (GPT-4 Mini, GPT-4, Claude 3.5 Sonnet, Gemini 2.0 Flash, Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1) with a dynamic model selector.
-   **AI Developer Assistant**: Dedicated full-screen chat interface for coding assistance, featuring syntax highlighting, a templates library (Code Review, Debug Help), and keyboard shortcuts.
-   **Telegram Bot Integration**: A full-featured Telegram bot offering:
    - Multi-model AI support with dynamic switching
    - Conversation history and context management
    - `/image` command - Generate images directly in Telegram
    - `/logo` command - Create professional logos in chat
    - `/smart` command - Intelligent assistant with intent understanding and VPS execution
    - Automatic webhook support in production (polling in development)
-   **Production-Ready Storage**: Automatic switching between PostgreSQL (Neon) and in-memory MemStorage based on environment configuration.
-   **Image Generator Studio**: Complete design studio accessible via `/image-generator` route featuring:
    - Image generation with customizable size, quality, and style
    - Professional logo creation for businesses
    - Full brand identity generation (colors, fonts, visual style, applications)
    - Direct download and preview capabilities
    - Real-time image display with loading states
-   **Intelligent Assistant System**: Multi-layered AI architecture accessible via `/intelligent-assistant` route featuring:
    - **Intent Analyzer**: Analyzes user messages to understand intent type (command/task/question), action needed, confidence level, and VPS target selection
    - **VPS Executor**: Connects to VPS servers via SSH, HTTP API, or custom protocols to execute commands automatically
    - **Smart Delegation**: Automatically delegates complex queries to more powerful AI models (GPT-4, Claude) when needed
    - **Conversation Context**: Maintains user conversation history for contextual understanding
    - **Execution Planning**: Generates step-by-step execution plans for complex tasks
    - **Suggestions System**: Provides intelligent follow-up suggestions based on context
    - Full integration with Telegram bot via `/smart` command

## External Dependencies

### AI Service Providers

-   **OpenAI**: Used for GPT-4 model interactions, DALL-E 3 image generation, GPT-4 Vision analysis, and Whisper speech-to-text.
-   **Anthropic**: Used for Claude model interactions.
-   **Google Generative AI**: Used for Gemini model interactions.
-   **Hugging Face**: Used for open-source models (Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1).

### Database

-   **Neon (PostgreSQL)**: Serverless PostgreSQL for persistent data storage, integrated via `@neondatabase/serverless` and Drizzle ORM.

### UI Component Libraries

-   **Radix UI**: Provides unstyled, accessible UI primitives.
-   **shadcn/ui**: Pre-styled components built on Radix UI, customizable with Tailwind CSS.

### Fonts

-   **Google Fonts**: Cairo & Tajawal for Arabic, Inter for English, Fira Code for code blocks.

### Development Tools (Replit-Specific)

-   `@replit/vite-plugin-runtime-error-modal`
-   `@replit/vite-plugin-cartographer`
-   `@replit/vite-plugin-dev-banner`

### Styling & Utilities

-   **Tailwind CSS**: Utility-first CSS framework with custom configuration for Arabic and RTL support.
-   **clsx & tailwind-merge**: For conditional class name composition.
-   **class-variance-authority**: For variant-based component styling.
-   **date-fns**: For date manipulation.