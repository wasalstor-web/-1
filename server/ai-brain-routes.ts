/**
 * AI Brain API Routes
 */

import type { Express } from "express";
import { getAIBrain } from "./ai-brain/core-brain";
import { getDoctorAI } from "./ai-brain/doctor-ai";

export function registerAIBrainRoutes(app: Express) {
  const brain = getAIBrain();
  const doctor = getDoctorAI();
  
  // AI Brain - معالجة الطلبات الذكية
  app.post("/api/ai-brain/process", async (req, res) => {
    try {
      const { input, sessionId, userId, context, intent, priority } = req.body;
      
      if (!input || !sessionId) {
        return res.status(400).json({ error: "input and sessionId are required" });
      }
      
      const response = await brain.process({
        input,
        sessionId,
        userId,
        context,
        intent,
        priority: priority || 'medium',
      });
      
      res.json(response);
    } catch (error: any) {
      console.error("AI Brain processing error:", error);
      res.status(500).json({ error: error.message || "Processing failed" });
    }
  });
  
  // AI Brain - التحليلات
  app.get("/api/ai-brain/analytics", async (req, res) => {
    try {
      const analytics = brain.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Doctor AI - فحص الصحة
  app.get("/api/doctor-ai/health", async (req, res) => {
    try {
      const health = await doctor.performHealthCheck();
      res.json(health);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Doctor AI - التقرير الشامل
  app.get("/api/doctor-ai/report", async (req, res) => {
    try {
      const report = doctor.getReport();
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Doctor AI - التوصيات
  app.get("/api/doctor-ai/recommendations", async (req, res) => {
    try {
      const status = req.query.status as any;
      const recommendations = doctor.getRecommendations(status);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Doctor AI - التحسين الذاتي
  app.post("/api/doctor-ai/self-improve", async (req, res) => {
    try {
      const improvements = await doctor.selfImprove();
      res.json({ improvements });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // AI Brain - إرسال لجميع النماذج المتصلة
  app.post("/api/ai-brain/process-all", async (req, res) => {
    try {
      const { input, sessionId, userId, context } = req.body;
      
      if (!input || !sessionId) {
        return res.status(400).json({ error: "input and sessionId are required" });
      }
      
      // قائمة النماذج المتاحة
      const availableModels = [
        { id: 'gpt-4', name: 'GPT-4', enabled: !!process.env.OPENAI_API_KEY },
        { id: 'gpt-4o-mini', name: 'GPT-4 Mini', enabled: !!process.env.OPENAI_API_KEY },
        { id: 'claude-3.5-sonnet', name: 'Claude 3.5', enabled: !!process.env.ANTHROPIC_API_KEY },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0', enabled: !!process.env.GEMINI_API_KEY },
        { id: 'qwen-2.5-coder', name: 'Qwen 2.5', enabled: !!process.env.HUGGINGFACE_API_KEY },
        { id: 'llama-3.3', name: 'LLaMA 3.3', enabled: !!process.env.HUGGINGFACE_API_KEY },
        { id: 'mistral-large', name: 'Mistral Large', enabled: !!process.env.HUGGINGFACE_API_KEY },
        { id: 'deepseek-r1', name: 'DeepSeek R1', enabled: !!process.env.HUGGINGFACE_API_KEY },
      ];
      
      // النماذج المتصلة فقط
      const connectedModels = availableModels.filter(m => m.enabled);
      
      // إرسال الطلب لكل نموذج متصل بالتوازي
      const responses = await Promise.allSettled(
        connectedModels.map(async (modelInfo) => {
          try {
            const response = await brain.process({
              input,
              sessionId,
              userId,
              context: {
                ...context,
                preferredModel: modelInfo.id
              },
              priority: 'high',
            });
            
            return {
              model: modelInfo.id,
              modelName: modelInfo.name,
              status: 'success',
              output: response.output,
              processingTime: 0,
            };
          } catch (error: any) {
            return {
              model: modelInfo.id,
              modelName: modelInfo.name,
              status: 'error',
              error: error.message || 'فشل في المعالجة',
            };
          }
        })
      );
      
      // تجهيز النتائج
      const results = responses.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            model: connectedModels[index].id,
            modelName: connectedModels[index].name,
            status: 'error',
            error: 'فشل في الاتصال',
          };
        }
      });
      
      res.json({
        totalModels: connectedModels.length,
        successfulResponses: results.filter(r => r.status === 'success').length,
        responses: results,
      });
    } catch (error: any) {
      console.error("AI Brain process-all error:", error);
      res.status(500).json({ error: error.message || "Processing failed" });
    }
  });
  
  // AI Brain - جميع النماذج المتاحة
  app.get("/api/ai-brain/models", (req, res) => {
    const models = [
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai', capabilities: ['chat', 'reasoning', 'code', 'analysis'], status: process.env.OPENAI_API_KEY ? 'connected' : 'disconnected' },
      { id: 'gpt-4o-mini', name: 'GPT-4 Mini', provider: 'openai', capabilities: ['chat', 'quick-response'], status: process.env.OPENAI_API_KEY ? 'connected' : 'disconnected' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', capabilities: ['chat', 'reasoning', 'code', 'analysis', 'long-context'], status: process.env.ANTHROPIC_API_KEY ? 'connected' : 'disconnected' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', capabilities: ['chat', 'multimodal', 'fast'], status: process.env.GEMINI_API_KEY ? 'connected' : 'disconnected' },
      { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder 32B', provider: 'huggingface', capabilities: ['code', 'reasoning', 'chat'], status: process.env.HUGGINGFACE_API_KEY ? 'connected' : 'disconnected' },
      { id: 'llama-3.3', name: 'LLaMA 3.3 70B', provider: 'huggingface', capabilities: ['chat', 'reasoning', 'analysis'], status: process.env.HUGGINGFACE_API_KEY ? 'connected' : 'disconnected' },
      { id: 'mistral-large', name: 'Mistral Large', provider: 'huggingface', capabilities: ['chat', 'reasoning', 'code'], status: process.env.HUGGINGFACE_API_KEY ? 'connected' : 'disconnected' },
      { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'huggingface', capabilities: ['reasoning', 'analysis', 'code'], status: process.env.HUGGINGFACE_API_KEY ? 'connected' : 'disconnected' },
    ];
    
    const connected = models.filter(m => m.status === 'connected');
    const disconnected = models.filter(m => m.status === 'disconnected');
    
    res.json({
      total: models.length,
      connected: connected.length,
      disconnected: disconnected.length,
      models,
      providers: {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        google: !!process.env.GEMINI_API_KEY,
        huggingface: !!process.env.HUGGINGFACE_API_KEY,
      }
    });
  });
}
