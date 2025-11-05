# منصة AI المتكاملة - Integrated AI Platform

## Overview

This is a comprehensive Arabic-first AI **Marketplace + Developer Platform** that combines three core features:

-   **AI Marketplace**: Shop for ready-made AI systems (chatbots, content generators, data analyzers). It allows users to browse 6+ pre-built AI products across 4 categories, view featured products, filter by category, and purchase AI systems.
-   **AI Developer Assistant**: Full-featured AI chat for coding help, debugging, and development support, with an Arabic-first interface and RTL support.
-   **AI Workspace**: Direct interaction with GPT-4, Claude, and Gemini models, enabling users to create and manage AI-powered projects, save conversations, and customize AI creativity levels.

The platform's ambition is to provide a fully functional, integrated AI development and consumption experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18+ and TypeScript, using Vite for development and bundling. Wouter handles routing, and TanStack Query manages server state. UI components are built using `shadcn/ui` based on Radix UI primitives, styled with Tailwind CSS, supporting an Arabic-first design with RTL layout and a Neon/Dark theme. Design patterns include component composition, custom hooks, and a mobile-first responsive approach. Key features include the Marketplace, Dashboard, Project management, AI Workspace with multi-model chat and customization, and a Settings page.

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
-   **Telegram Bot Integration**: A full-featured Telegram bot offering multi-model AI support, conversation history, and dynamic model switching via inline keyboard.
-   **Production-Ready Storage**: Automatic switching between PostgreSQL (Neon) and in-memory MemStorage based on environment configuration.
-   **Multimodal AI Features**: Image generation (DALL-E 3), vision analysis (GPT-4 Vision), speech-to-text (Whisper), logo generator, and brand identity generator.

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