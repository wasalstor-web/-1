# منصة مبسط AI - Mubsat AI Platform

## Overview
**Mubsat AI Platform** is an enterprise B2B SaaS platform offering a **Client Interface** for businesses to discover and purchase AI solutions, and an **Admin Panel** for internal management. The Admin Panel functions as an Arabic-first AI Marketplace and Developer Platform, combining an AI Marketplace, AI Developer Assistant, AI Workspace, Design Studio (Image Generator), and an Intelligent Assistant. The platform aims to provide a comprehensive, integrated AI development and consumption experience with advanced automation, including the generation of deployable AI agents.

The platform also includes the **AI Executive Agent vMax**, a comprehensive orchestration system combining specialized sub-agents (Orchestrator, Architect, Builder, Guardian, Doctor AI, Memory Agent) for autonomous platform management. Key features of vMax include a decision log with an immutable audit trail, automatic approval gates for high-risk operations, cost estimation, canary deployment with automatic rollback, security validation, and contextual memory.

## User Preferences
Preferred communication style: Simple, everyday language.

When receiving any file from the user (regardless of extension), the assistant automatically:
1. Analyzes the file type and determines if it's a web project, individual file, or compressed package
2. Uploads the file automatically to the specified server using secure protocol (SFTP/SSH) via pre-registered connection credentials
3. Deploys files to the appropriate path (`/var/www/<project_name>/`) and runs or reloads necessary services (such as Nginx, Node, or PHP-FPM)
4. Analyzes logs immediately after upload to detect errors and operational issues
5. Handles errors automatically via intelligent debugging models, then retries if necessary
6. Generates a final report showing:
   - Upload status (success/failed/fixed)
   - Errors that were handled
   - Execution time
   - Final URL if available
7. Interacts naturally within the same conversation interface, without showing new tools or additional screens

**Deployment Target Server:**
- IP: 46.202.159.100
- User: root
- App Directory: /var/www/mubsat-ai
- Auto-deploy on file upload or explicit request

## System Architecture

### Frontend Architecture
Built with React 18+ and TypeScript, using Vite, Wouter for routing, and TanStack Query for server state. UI components are `shadcn/ui` based on Radix UI, styled with Tailwind CSS, supporting an Arabic-first design with RTL layout and a Neon/Dark theme. Emphasizes component composition, custom hooks, and mobile-first responsiveness.

### Backend Architecture
Uses Express.js with TypeScript, providing RESTful API endpoints and streaming support for AI chat. Drizzle ORM is used with PostgreSQL (Neon) for type-safe database operations. Database schema includes tables for users, projects, conversations, AI conversations, AI messages, servers, and server commands.

### AI Integration Architecture
Supports multiple AI models: OpenAI (GPT-4, DALL-E 3, Vision, Whisper), Anthropic (Claude 3.5 Sonnet), Google Generative AI (Gemini 2.0 Flash), and Hugging Face (Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1). Features a unified chat interface with streaming responses, model selection, and creativity control. The Intelligent Assistant includes an `IntentAnalyzer`, `VPS Executor` for remote server interaction, and a `Self-Improvement Engine`, along with an `ABI (Agent Binary Interface) Generator` for deployable AI agents.

### Multimodal AI Capabilities
Integrates DALL-E 3 for image/logo generation, GPT-4 Vision for image analysis, and Whisper for speech-to-text with Arabic support.

### System Design Choices
Prioritizes Arabic-first design with RTL support and a Neon/Dark theme. Features multi-model AI support, a dedicated AI Developer Assistant, Telegram Bot integration, SSH remote server management, production-ready storage, and an advanced Intelligent Assistant system. The ABI Generator creates standalone AI agent packages (`ai-agent.js` and `package.json`) for diverse hosting environments with API key authentication and command whitelisting.

## External Dependencies

### AI Service Providers
-   **OpenAI**: GPT-4 models, DALL-E 3, GPT-4 Vision, Whisper.
-   **Anthropic**: Claude models.
-   **Google Generative AI**: Gemini models.
-   **Hugging Face**: Open-source models (Qwen 2.5 Coder, LLaMA 3.3, Mistral Large, DeepSeek R1).

### Database
-   **Neon (PostgreSQL)**: Serverless PostgreSQL for persistent data storage, integrated via `@neondatabase/serverless` and Drizzle ORM.

### UI Component Libraries
-   **Radix UI**: Unstyled, accessible UI primitives.
-   **shadcn/ui**: Pre-styled components built on Radix UI.

### Fonts
-   **Google Fonts**: Cairo & Tajawal (Arabic), Inter (English), Fira Code (code blocks).

### Styling & Utilities
-   **Tailwind CSS**: Utility-first CSS framework with custom configuration for Arabic and RTL support.
-   **clsx & tailwind-merge**: For conditional class name composition.
-   **class-variance-authority**: For variant-based component styling.
-   **date-fns**: For date manipulation.