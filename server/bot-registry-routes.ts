import type { Express } from "express";
import { db } from "./db";
import { 
  botTemplates, 
  botInstances, 
  botDeployments, 
  botTestCases,
  insertBotTemplateSchema,
  insertBotInstanceSchema,
  insertBotDeploymentSchema,
  insertBotTestCaseSchema,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import { join } from "path";
import { fromZodError } from "zod-validation-error";

export function registerBotRegistryRoutes(app: Express) {
  
  // ==================== BOT TEMPLATES ====================
  
  // Get all templates
  app.get("/api/bot-templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let templates;
      if (category) {
        templates = await db.select().from(botTemplates).where(eq(botTemplates.category, category));
      } else {
        templates = await db.select().from(botTemplates);
      }
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching bot templates:", error);
      res.status(500).json({ error: "Failed to fetch bot templates" });
    }
  });
  
  // Get single template
  app.get("/api/bot-templates/:id", async (req, res) => {
    try {
      const template = await db.select().from(botTemplates).where(eq(botTemplates.id, req.params.id)).limit(1);
      
      if (!template.length) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(template[0]);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });
  
  // Create template
  app.post("/api/bot-templates", async (req, res) => {
    try {
      const validatedData = insertBotTemplateSchema.parse(req.body);
      const template = await db.insert(botTemplates).values(validatedData).returning();
      res.status(201).json(template[0]);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });
  
  // Update template
  app.patch("/api/bot-templates/:id", async (req, res) => {
    try {
      const validatedData = insertBotTemplateSchema.partial().parse(req.body);
      const updated = await db
        .update(botTemplates)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(botTemplates.id, req.params.id))
        .returning();
      
      if (!updated.length) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(updated[0]);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });
  
  // Delete template
  app.delete("/api/bot-templates/:id", async (req, res) => {
    try {
      await db.delete(botTemplates).where(eq(botTemplates.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });
  
  // Load default templates from JSON (idempotent - upserts based on name)
  app.post("/api/bot-templates/load-defaults", async (req, res) => {
    try {
      const templatesPath = join(process.cwd(), 'server/bot-templates/templates.json');
      const templatesData = await readFile(templatesPath, 'utf-8');
      const templates = JSON.parse(templatesData);
      
      const upserted = [];
      let insertedCount = 0;
      let updatedCount = 0;
      
      for (const template of templates) {
        const manifestStr = JSON.stringify(template.manifest);
        
        const validatedData = insertBotTemplateSchema.parse({
          name: template.name,
          displayName: template.displayName,
          description: template.description,
          category: template.category,
          version: template.version,
          manifest: manifestStr,
          icon: template.icon,
          tags: template.tags,
          isPublic: true,
          isActive: true,
        });
        
        const existing = await db.select().from(botTemplates).where(eq(botTemplates.name, template.name)).limit(1);
        
        if (existing.length > 0) {
          const updated = await db
            .update(botTemplates)
            .set({ ...validatedData, updatedAt: new Date() })
            .where(eq(botTemplates.name, template.name))
            .returning();
          upserted.push(updated[0]);
          updatedCount++;
        } else {
          const inserted = await db.insert(botTemplates).values(validatedData).returning();
          upserted.push(inserted[0]);
          insertedCount++;
        }
      }
      
      res.json({ 
        message: `Loaded ${upserted.length} default templates (${insertedCount} new, ${updatedCount} updated)`, 
        templates: upserted,
        inserted: insertedCount,
        updated: updatedCount,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed in template data", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error loading default templates:", error);
      res.status(500).json({ error: "Failed to load default templates" });
    }
  });
  
  // ==================== BOT INSTANCES ====================
  
  // Get all instances
  app.get("/api/bot-instances", async (req, res) => {
    try {
      const ownerId = req.query.ownerId as string | undefined;
      const templateId = req.query.templateId as string | undefined;
      
      let instances;
      if (ownerId) {
        instances = await db.select().from(botInstances).where(eq(botInstances.ownerId, ownerId));
      } else if (templateId) {
        instances = await db.select().from(botInstances).where(eq(botInstances.templateId, templateId));
      } else {
        instances = await db.select().from(botInstances);
      }
      
      res.json(instances);
    } catch (error) {
      console.error("Error fetching instances:", error);
      res.status(500).json({ error: "Failed to fetch instances" });
    }
  });
  
  // Get single instance
  app.get("/api/bot-instances/:id", async (req, res) => {
    try {
      const instance = await db.select().from(botInstances).where(eq(botInstances.id, req.params.id)).limit(1);
      
      if (!instance.length) {
        return res.status(404).json({ error: "Instance not found" });
      }
      
      res.json(instance[0]);
    } catch (error) {
      console.error("Error fetching instance:", error);
      res.status(500).json({ error: "Failed to fetch instance" });
    }
  });
  
  // Create instance from template
  app.post("/api/bot-instances", async (req, res) => {
    try {
      const { templateId, customization, ...instanceData } = req.body;
      
      // Get template
      const template = await db.select().from(botTemplates).where(eq(botTemplates.id, templateId)).limit(1);
      
      if (!template.length) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      // Parse manifest and apply customization
      let manifest = JSON.parse(template[0].manifest);
      if (customization) {
        manifest = { ...manifest, ...customization };
      }
      
      // Validate instance data
      const validatedData = insertBotInstanceSchema.parse({
        ...instanceData,
        templateId,
        manifest: JSON.stringify(manifest),
      });
      
      // Create instance
      const instance = await db.insert(botInstances).values(validatedData).returning();
      
      // Increment template usage
      await db.update(botTemplates)
        .set({ usageCount: template[0].usageCount + 1 })
        .where(eq(botTemplates.id, templateId));
      
      res.status(201).json(instance[0]);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error creating instance:", error);
      res.status(500).json({ error: "Failed to create instance" });
    }
  });
  
  // Update instance
  app.patch("/api/bot-instances/:id", async (req, res) => {
    try {
      const validatedData = insertBotInstanceSchema.partial().parse(req.body);
      const updated = await db
        .update(botInstances)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(botInstances.id, req.params.id))
        .returning();
      
      if (!updated.length) {
        return res.status(404).json({ error: "Instance not found" });
      }
      
      res.json(updated[0]);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error updating instance:", error);
      res.status(500).json({ error: "Failed to update instance" });
    }
  });
  
  // Delete instance
  app.delete("/api/bot-instances/:id", async (req, res) => {
    try {
      await db.delete(botInstances).where(eq(botInstances.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting instance:", error);
      res.status(500).json({ error: "Failed to delete instance" });
    }
  });
  
  // Export instance
  app.get("/api/bot-instances/:id/export", async (req, res) => {
    try {
      const instance = await db.select().from(botInstances).where(eq(botInstances.id, req.params.id)).limit(1);
      
      if (!instance.length) {
        return res.status(404).json({ error: "Instance not found" });
      }
      
      const manifest = JSON.parse(instance[0].manifest);
      const exportData = {
        instance: instance[0],
        manifest,
        exportedAt: new Date().toISOString(),
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${instance[0].name}-export.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting instance:", error);
      res.status(500).json({ error: "Failed to export instance" });
    }
  });
  
  // ==================== BOT DEPLOYMENTS ====================
  
  // Get deployments
  app.get("/api/bot-deployments", async (req, res) => {
    try {
      const instanceId = req.query.instanceId as string | undefined;
      
      let deployments;
      if (instanceId) {
        deployments = await db.select().from(botDeployments).where(eq(botDeployments.instanceId, instanceId));
      } else {
        deployments = await db.select().from(botDeployments);
      }
      
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ error: "Failed to fetch deployments" });
    }
  });
  
  // Create deployment
  app.post("/api/bot-deployments", async (req, res) => {
    try {
      const validatedData = insertBotDeploymentSchema.parse(req.body);
      const deployment = await db.insert(botDeployments).values(validatedData).returning();
      
      // Update instance last deploy time
      await db.update(botInstances)
        .set({ lastDeployAt: new Date() })
        .where(eq(botInstances.id, validatedData.instanceId));
      
      res.status(201).json(deployment[0]);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error creating deployment:", error);
      res.status(500).json({ error: "Failed to create deployment" });
    }
  });
  
  // Update deployment status
  app.patch("/api/bot-deployments/:id/status", async (req, res) => {
    try {
      const { status, metrics } = req.body;
      
      const validatedData = insertBotDeploymentSchema.partial().parse({ status });
      
      const updated = await db
        .update(botDeployments)
        .set({ 
          status: validatedData.status, 
          metrics: metrics ? JSON.stringify(metrics) : undefined,
          completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
        })
        .where(eq(botDeployments.id, req.params.id))
        .returning();
      
      if (!updated.length) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      
      res.json(updated[0]);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(error).toString() 
        });
      }
      console.error("Error updating deployment status:", error);
      res.status(500).json({ error: "Failed to update deployment status" });
    }
  });
  
  // ==================== BOT TEST CASES ====================
  
  // Get test cases
  app.get("/api/bot-test-cases", async (req, res) => {
    try {
      const instanceId = req.query.instanceId as string | undefined;
      const templateId = req.query.templateId as string | undefined;
      
      let testCases;
      if (instanceId) {
        testCases = await db.select().from(botTestCases).where(eq(botTestCases.instanceId, instanceId));
      } else if (templateId) {
        testCases = await db.select().from(botTestCases).where(eq(botTestCases.templateId, templateId));
      } else {
        testCases = await db.select().from(botTestCases);
      }
      
      res.json(testCases);
    } catch (error) {
      console.error("Error fetching test cases:", error);
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });
  
  // Create test case
  app.post("/api/bot-test-cases", async (req, res) => {
    try {
      const testCase = await db.insert(botTestCases).values(req.body).returning();
      res.status(201).json(testCase[0]);
    } catch (error) {
      console.error("Error creating test case:", error);
      res.status(500).json({ error: "Failed to create test case" });
    }
  });
  
  // Execute test case
  app.post("/api/bot-test-cases/:id/execute", async (req, res) => {
    try {
      const { actualOutput, passed, executionTime } = req.body;
      
      const updated = await db
        .update(botTestCases)
        .set({ 
          actualOutput, 
          passed, 
          executionTime,
          status: passed ? 'passed' : 'failed',
          lastRunAt: new Date()
        })
        .where(eq(botTestCases.id, req.params.id))
        .returning();
      
      if (!updated.length) {
        return res.status(404).json({ error: "Test case not found" });
      }
      
      res.json(updated[0]);
    } catch (error) {
      console.error("Error executing test case:", error);
      res.status(500).json({ error: "Failed to execute test case" });
    }
  });
  
  // Run all test cases for instance
  app.post("/api/bot-instances/:id/run-tests", async (req, res) => {
    try {
      const testCases = await db.select().from(botTestCases).where(eq(botTestCases.instanceId, req.params.id));
      
      const results = {
        total: testCases.length,
        passed: 0,
        failed: 0,
        pending: testCases.length,
      };
      
      // Update instance test time
      await db.update(botInstances)
        .set({ lastTestAt: new Date() })
        .where(eq(botInstances.id, req.params.id));
      
      res.json({ 
        message: "Test execution started", 
        results,
        testCases 
      });
    } catch (error) {
      console.error("Error running tests:", error);
      res.status(500).json({ error: "Failed to run tests" });
    }
  });
}
