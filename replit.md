# منصة مبسط AI - Mubsat AI Platform

## Overview

**Mubsat AI Platform (منصة مبسط AI)** is an enterprise B2B SaaS platform combining a **Client Interface** and **Admin Panel**:

### Client Interface (B2B SaaS)
A professional, enterprise-grade website for businesses to discover and purchase AI solutions:
- **Homepage**: Hero section, solutions showcase, product catalog, API integrations, dashboard preview, pricing, contact form
- **Solutions Page**: Detailed AI automation, analytics, and integration solutions
- **Pricing Page**: Three-tier pricing plans (Starter, Professional, Enterprise)
- **Contact Page**: Sales inquiry and demo request forms
- **Design Inspiration**: Zebra Technologies (clean, corporate, industrial blue) + Buraq.ai (structured layouts, elevated cards)

### Admin Panel (Internal Management)
A comprehensive Arabic-first AI **Marketplace + Developer Platform** that combines five core features:

-   **AI Marketplace**: Allows users to browse and purchase pre-built AI systems (chatbots, content generators, data analyzers).
-   **AI Developer Assistant**: Provides full-featured AI chat for coding help, debugging, and development support, with an Arabic-first interface and RTL support.
-   **AI Workspace**: Enables direct interaction with multiple AI models (GPT-4, Claude, Gemini, Hugging Face models) for creating and managing AI-powered projects, saving conversations, and customizing AI creativity levels.
-   **Design Studio (Image Generator)**: Offers comprehensive multimodal AI capabilities including image generation (DALL-E 3), logo creation, and brand identity generation.
-   **Intelligent Assistant**: An advanced multi-layered AI system that analyzes intent, delegates to specialized models, executes commands, and connects to VPS servers automatically for task execution, including natural language server control and self-improvement capabilities.

The platform's ambition is to provide a fully functional, integrated AI development and consumption experience with intelligent automation capabilities, including the ability to generate deployable AI agents (ABI) for various hosting environments.

## User Preferences

Preferred communication style: Simple, everyday language.

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