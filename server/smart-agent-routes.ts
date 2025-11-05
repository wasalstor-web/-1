/**
 * Smart Agent API Routes
 * مسارات API للوكيل الذكي المتقدم
 */

import type { Express } from "express";
import { getSmartAgent } from "./smart-agent/advanced-agent";

export function registerSmartAgentRoutes(app: Express) {
  const agent = getSmartAgent();
  
  // تنفيذ مهمة
  app.post("/api/smart-agent/execute", async (req, res) => {
    try {
      const { task, context } = req.body;
      
      if (!task) {
        return res.status(400).json({ error: "task is required" });
      }
      
      console.log(`🤖 Smart Agent: تلقيت مهمة: "${task}"`);
      
      const result = await agent.execute(task, context);
      
      res.json({
        success: result.success,
        output: result.output,
        thinking: result.thinking,
        learnings: result.learnings,
        nextSteps: result.nextSteps,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Smart Agent execution error:", error);
      res.status(500).json({ 
        error: error.message || "فشل في تنفيذ المهمة",
        success: false
      });
    }
  });
  
  // الحصول على حالة الوكيل
  app.get("/api/smart-agent/status", (req, res) => {
    try {
      const status = agent.getStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // الحصول على الذاكرة
  app.get("/api/smart-agent/memory", (req, res) => {
    try {
      const memory = agent.getMemory();
      res.json(memory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // محادثة مع الوكيل الذكي
  app.post("/api/smart-agent/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }
      
      const result = await agent.execute(message, context);
      
      res.json({
        message: result.output,
        thinking: result.thinking,
        success: result.success,
        learnings: result.learnings
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
