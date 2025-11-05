import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertConversationSchema, insertCategorySchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertAiConversationSchema, insertAiMessageSchema, insertServerSchema } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";
import { PLATFORM_SYSTEM_PROMPT } from "./ai-system-prompt";
import type { TelegramAIBot } from "./telegram-bot";
import { IntelligentAssistant } from "./intelligent-agent/intelligent-assistant";

export async function registerRoutes(app: Express, telegramBot?: TelegramAIBot | null): Promise<Server> {
  // Initialize AI clients only if API keys are available
  let openai: OpenAI | null = null;
  let anthropic: Anthropic | null = null;
  let gemini: GoogleGenerativeAI | null = null;
  let hf: HfInference | null = null;

  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  if (process.env.HUGGINGFACE_API_KEY) {
    hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  // Initialize Intelligent Assistant
  const intelligentAssistant = new IntelligentAssistant();

  // Intelligent Assistant API routes
  app.post("/api/intelligent-assistant/process", async (req, res) => {
    try {
      const { userId, message } = req.body;

      if (!userId || !message) {
        return res.status(400).json({ error: "userId and message are required" });
      }

      const response = await intelligentAssistant.processMessage(userId, message);
      res.json(response);
    } catch (error: any) {
      console.error("Error in intelligent assistant:", error);
      res.status(500).json({ error: error.message || "Failed to process message" });
    }
  });

  app.post("/api/intelligent-assistant/clear-history", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      intelligentAssistant.clearHistory(userId);
      res.json({ success: true, message: "History cleared" });
    } catch (error: any) {
      console.error("Error clearing history:", error);
      res.status(500).json({ error: error.message || "Failed to clear history" });
    }
  });

  app.get("/api/intelligent-assistant/system-prompt", (req, res) => {
    res.json({ systemPrompt: intelligentAssistant.getSystemPrompt() });
  });

  // ABI Generation endpoints
  app.post("/api/intelligent-assistant/generate-abi", (req, res) => {
    try {
      const { serverName, serverType } = req.body;

      if (!serverName) {
        return res.status(400).json({ error: "serverName is required" });
      }

      const validServerTypes = ['vps', 'hostinger', 'shared'];
      const type = serverType && validServerTypes.includes(serverType) ? serverType : 'vps';

      const abiData = intelligentAssistant.generateABIForServer(serverName, type);
      
      res.json({
        success: true,
        serverName,
        serverType: type,
        files: {
          'ai-agent.js': abiData.abiCode,
          'package.json': abiData.packageJson,
        },
        instructions: abiData.instructions,
      });
    } catch (error: any) {
      console.error("Error generating ABI:", error);
      res.status(500).json({ error: error.message || "Failed to generate ABI" });
    }
  });

  app.get("/api/intelligent-assistant/download-abi/:serverName", (req, res) => {
    try {
      const { serverName } = req.params;
      const { serverType = 'vps' } = req.query;

      const abiData = intelligentAssistant.generateABIForServer(
        serverName, 
        serverType as 'vps' | 'hostinger' | 'shared'
      );

      // إرجاع الملف للتنزيل
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Content-Disposition', `attachment; filename="ai-agent-${serverName}.js"`);
      res.send(abiData.abiCode);
    } catch (error: any) {
      console.error("Error downloading ABI:", error);
      res.status(500).json({ error: error.message || "Failed to download ABI" });
    }
  });

  // Server Management routes
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      res.json(servers);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  app.post("/api/servers", async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(validatedData);
      res.status(201).json(server);
    } catch (error) {
      console.error("Error creating server:", error);
      res.status(400).json({ error: "Invalid server data" });
    }
  });

  app.post("/api/servers/:id/test", async (req, res) => {
    try {
      const server = await storage.getServer(req.params.id);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }

      // اختبار الاتصال بالسيرفر
      const testUrl = `http://${server.host}:${server.port}/health`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${server.apiKey}`
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        // تحديث lastPing
        await storage.updateServerPing(server.id);
        res.json({ 
          success: true, 
          status: 'online',
          serverData: data
        });
      } else {
        res.json({ 
          success: false, 
          status: 'error',
          error: `HTTP ${response.status}`
        });
      }
    } catch (error: any) {
      console.error("Error testing server:", error);
      res.json({ 
        success: false, 
        status: 'offline',
        error: error.message 
      });
    }
  });

  app.post("/api/servers/:id/execute", async (req, res) => {
    try {
      const { command } = req.body;
      const server = await storage.getServer(req.params.id);
      
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }

      if (!server.isActive) {
        return res.status(403).json({ error: "Server is not active" });
      }

      // إرسال الأمر للسيرفر
      const executeUrl = `http://${server.host}:${server.port}/run`;
      const response = await fetch(executeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${server.apiKey}`
        },
        body: JSON.stringify({ 
          cmd: command,
          key: server.apiKey 
        }),
        signal: AbortSignal.timeout(30000)
      });

      const data = await response.json();
      
      if (data.ok) {
        // تحديث lastPing عند النجاح
        await storage.updateServerPing(server.id);
      }

      res.json(data);
    } catch (error: any) {
      console.error("Error executing command on server:", error);
      res.status(500).json({ error: error.message || "Failed to execute command" });
    }
  });

  app.delete("/api/servers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteServer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting server:", error);
      res.status(500).json({ error: "Failed to delete server" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Conversation routes
  app.get("/api/projects/:projectId/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByProject(req.params.projectId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  // AI Chat endpoint with streaming support
  app.post("/api/chat", async (req, res) => {
    try {
      const { model, messages, temperature = 0.7 } = req.body;

      if (!model || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (model === 'gpt-4') {
        if (!openai) {
          return res.status(503).json({ error: "OpenAI API key not configured" });
        }
        const stream = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: messages,
          temperature: temperature,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      } else if (model === 'claude') {
        if (!anthropic) {
          return res.status(503).json({ error: "Anthropic API key not configured" });
        }
        const stream = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          temperature: temperature,
          messages: messages,
          stream: true,
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
          }
        }
      } else if (model === 'gemini') {
        if (!gemini) {
          return res.status(503).json({ error: "Gemini API key not configured" });
        }
        const geminiModel = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Convert messages to Gemini format
        const prompt = messages.map((m: any) => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n\n');

        const result = await geminiModel.generateContentStream(prompt);
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }
      } else {
        return res.status(400).json({ error: "Invalid AI model" });
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured } = req.query;
      let products;
      
      if (category) {
        const cat = await storage.getCategoryBySlug(category as string);
        if (cat) {
          products = await storage.getProductsByCategory(cat.id);
        } else {
          return res.status(404).json({ error: "Category not found" });
        }
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Order routes
  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrdersByUser(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders/:id/items", async (req, res) => {
    try {
      const validatedData = insertOrderItemSchema.parse({
        ...req.body,
        orderId: req.params.id,
      });
      const item = await storage.createOrderItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating order item:", error);
      res.status(400).json({ error: "Invalid order item data" });
    }
  });

  // AI Conversation routes
  app.get("/api/ai/conversations", async (req, res) => {
    try {
      const { userId } = req.query;
      const conversations = await storage.getAllAiConversations(userId as string | undefined);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/ai/conversations", async (req, res) => {
    try {
      const validatedData = insertAiConversationSchema.parse(req.body);
      const conversation = await storage.createAiConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating AI conversation:", error);
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  app.get("/api/ai/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getAiConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching AI conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.delete("/api/ai/conversations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAiConversation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting AI conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.get("/api/ai/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching AI messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/ai/conversations/:id/messages", async (req, res) => {
    try {
      const validatedData = insertAiMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
      });
      const message = await storage.createAiMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating AI message:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // AI Chat stream endpoint with Multi-Model Support
  app.post("/api/ai/chat/stream", async (req, res) => {
    try {
      const { messages, context = 'general', model = 'gpt-4o-mini' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages are required" });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Use comprehensive platform system prompt
      const systemPrompt = PLATFORM_SYSTEM_PROMPT;

      // GPT-4 Mini (OpenAI)
      if (model === 'gpt-4o-mini' || model === 'gpt-4') {
        if (!openai) {
          return res.status(503).json({ error: "OpenAI API not available" });
        }

        const stream = await openai.chat.completions.create({
          model: model === 'gpt-4' ? 'gpt-4o' : 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          stream: true,
          temperature: 0.7,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      }
      
      // Claude (Anthropic)
      else if (model.startsWith('claude')) {
        if (!anthropic) {
          return res.status(503).json({ error: "Anthropic API not available" });
        }

        const stream = await anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: messages,
          system: systemPrompt,
          temperature: 0.7,
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const content = chunk.delta.text;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }
        }
      }
      
      // Gemini (Google)
      else if (model.startsWith('gemini')) {
        if (!gemini) {
          return res.status(503).json({ error: "Gemini API not available" });
        }

        const geminiModel = gemini.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          systemInstruction: systemPrompt 
        });

        const chat = geminiModel.startChat({
          history: messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
        });

        const result = await chat.sendMessageStream(messages[messages.length - 1].content);

        for await (const chunk of result.stream) {
          const content = chunk.text();
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      }
      
      // Hugging Face Models (Open Source)
      else if (model.startsWith('hf-')) {
        if (!hf) {
          return res.status(503).json({ error: "Hugging Face API not available" });
        }

        // Map model names to Hugging Face model IDs
        const modelMap: Record<string, string> = {
          'hf-qwen-7b': 'Qwen/Qwen2.5-7B-Instruct',
          'hf-qwen-14b': 'Qwen/Qwen2.5-14B-Instruct',
          'hf-qwen-32b': 'Qwen/Qwen2.5-32B-Instruct',
          'hf-mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3',
          'hf-llama-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          'hf-deepseek-7b': 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        };

        const hfModel = modelMap[model];
        if (!hfModel) {
          return res.status(400).json({ error: "Unknown Hugging Face model" });
        }

        // Build conversation history with system prompt
        const conversationHistory = [
          { role: 'system', content: systemPrompt },
          ...messages
        ];

        // Hugging Face streaming
        const stream = hf.chatCompletionStream({
          model: hfModel,
          messages: conversationHistory as any,
          max_tokens: 2048,
          temperature: 0.7,
        });

        for await (const chunk of stream) {
          if (chunk.choices && chunk.choices.length > 0) {
            const content = chunk.choices[0].delta?.content || '';
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          }
        }
      }
      
      else {
        return res.status(400).json({ error: "Invalid model specified" });
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Error in AI chat stream:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // Image Generation endpoint (DALL-E)
  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { prompt, size = "1024x1024", quality = "standard", style = "vivid" } = req.body;

      if (!openai) {
        return res.status(503).json({ error: "OpenAI API not available" });
      }

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size as "1024x1024" | "1792x1024" | "1024x1792",
        quality: quality as "standard" | "hd",
        style: style as "vivid" | "natural",
      });

      res.json({
        url: response.data?.[0]?.url,
        revised_prompt: response.data?.[0]?.revised_prompt,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Vision/Image Analysis endpoint (GPT-4 Vision)
  app.post("/api/ai/analyze-image", async (req, res) => {
    try {
      const { imageUrl, prompt = "ما الذي تراه في هذه الصورة؟ صفها بالتفصيل." } = req.body;

      if (!openai) {
        return res.status(503).json({ error: "OpenAI API not available" });
      }

      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 1000,
      });

      res.json({
        analysis: response.choices[0].message.content,
      });
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // Speech to Text endpoint (Whisper)
  app.post("/api/ai/speech-to-text", async (req, res) => {
    try {
      const { audioUrl } = req.body;

      if (!openai) {
        return res.status(503).json({ error: "OpenAI API not available" });
      }

      if (!audioUrl) {
        return res.status(400).json({ error: "Audio URL is required" });
      }

      // Download audio file
      const audioResponse = await fetch(audioUrl);
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioFile = new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "ar", // Arabic
      });

      res.json({
        text: transcription.text,
      });
    } catch (error: any) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });

  // Logo & Brand Identity Generator
  app.post("/api/ai/generate-logo", async (req, res) => {
    try {
      const { 
        businessName, 
        industry, 
        style = "modern",
        colors = "professional",
        description = "" 
      } = req.body;

      if (!openai) {
        return res.status(503).json({ error: "OpenAI API not available" });
      }

      if (!businessName || !industry) {
        return res.status(400).json({ error: "Business name and industry are required" });
      }

      // Build optimized prompt for logo generation
      const logoPrompt = `Create a professional logo for "${businessName}", a ${industry} business. 
Style: ${style}, Colors: ${colors}. ${description}
The logo should be:
- Clean and minimalist
- Suitable for digital and print
- Memorable and unique
- Vector-style illustration
- On white background
- Professional and modern`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: logoPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
      });

      res.json({
        url: response.data?.[0]?.url,
        revised_prompt: response.data?.[0]?.revised_prompt,
        businessName,
        industry,
      });
    } catch (error: any) {
      console.error("Error generating logo:", error);
      res.status(500).json({ error: error.message || "Failed to generate logo" });
    }
  });

  // Brand Identity Package Generator
  app.post("/api/ai/generate-brand-identity", async (req, res) => {
    try {
      const { 
        businessName, 
        industry, 
        values = [],
        targetAudience = "",
        stylePreferences = ""
      } = req.body;

      if (!openai) {
        return res.status(503).json({ error: "OpenAI API not available" });
      }

      if (!businessName || !industry) {
        return res.status(400).json({ error: "Business name and industry are required" });
      }

      // Generate brand strategy using GPT-4
      const strategyPrompt = `أنت خبير في تصميم الهوية البصرية والعلامات التجارية.

قم بإنشاء هوية بصرية كاملة لـ:
- اسم العمل: ${businessName}
- المجال: ${industry}
- القيم: ${values.join(", ") || "غير محدد"}
- الجمهور المستهدف: ${targetAudience || "غير محدد"}
- التفضيلات: ${stylePreferences || "غير محدد"}

قدم:
1. **الشعار**: وصف تفصيلي للشعار المقترح
2. **الألوان**: لوحة ألوان كاملة (Primary, Secondary, Accent) مع أكواد Hex
3. **الخطوط**: اقتراحات خطوط للعناوين والنصوص
4. **النمط البصري**: وصف الأسلوب والمزاج العام
5. **التطبيقات**: كيفية استخدام الهوية (موقع، بطاقات، وسائل تواصل)

قدم الإجابة بتنسيق JSON مع هذه المفاتيح:
{
  "logo_description": "...",
  "color_palette": {
    "primary": "#000000",
    "secondary": "#000000",
    "accent": "#000000"
  },
  "fonts": {
    "heading": "...",
    "body": "..."
  },
  "visual_style": "...",
  "applications": []
}`;

      const strategyResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "أنت خبير تصميم هوية بصرية محترف" },
          { role: "user", content: strategyPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const brandStrategy = JSON.parse(strategyResponse.choices[0].message.content || "{}");

      res.json({
        businessName,
        industry,
        strategy: brandStrategy,
      });
    } catch (error: any) {
      console.error("Error generating brand identity:", error);
      res.status(500).json({ error: error.message || "Failed to generate brand identity" });
    }
  });

  // Telegram Webhook endpoint
  app.post("/api/telegram-webhook", (req, res) => {
    try {
      if (telegramBot && telegramBot.getBot()) {
        // Process the update from Telegram
        telegramBot.getBot()!.processUpdate(req.body);
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("Error handling Telegram webhook:", error);
      res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
