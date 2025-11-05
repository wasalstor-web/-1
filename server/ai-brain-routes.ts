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
}
