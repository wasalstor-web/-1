import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { botManifestSchema } from "./bot-manifest";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('draft'),
  progress: integer("progress").notNull().default(0),
  aiModel: text("ai_model"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  aiModel: text("ai_model").notNull(),
  messages: text("messages").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  image: text("image"),
  images: text("images").array(),
  features: text("features").array(),
  demoUrl: text("demo_url"),
  downloadUrl: text("download_url"),
  apiDocUrl: text("api_doc_url"),
  sourceType: text("source_type").notNull().default('download'),
  rating: decimal("rating", { precision: 2, scale: 1 }).default('0'),
  totalSales: integer("total_sales").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  productId: varchar("product_id").references(() => products.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  context: text("context").notNull().default('general'),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => aiConversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  codeSnippets: text("code_snippets"),
  interactiveOptions: text("interactive_options"),
  status: text("status").default('sent'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const telegramUsers = pgTable("telegram_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramUserId: bigint("telegram_user_id", { mode: 'number' }).notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  selectedModel: text("selected_model").notNull().default('gpt-4o-mini'),
  conversationHistory: text("conversation_history").notNull().default('[]'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull().default(45000),
  apiKey: text("api_key").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastPing: timestamp("last_ping"),
  sshEnabled: boolean("ssh_enabled").notNull().default(false),
  sshHost: text("ssh_host"),
  sshPort: integer("ssh_port").default(22),
  sshUsername: text("ssh_username"),
  sshPassword: text("ssh_password"),
  sshPrivateKey: text("ssh_private_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serverCommands = pgTable("server_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  command: text("command").notNull(),
  status: text("status").notNull().default('pending'),
  result: text("result"),
  exitCode: integer("exit_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  executedAt: timestamp("executed_at"),
});

export const botTemplates = pgTable("bot_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  version: text("version").notNull().default('1.0.0'),
  manifest: text("manifest").notNull(),
  icon: text("icon"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const botInstances = pgTable("bot_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => botTemplates.id),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  manifest: text("manifest").notNull(),
  status: text("status").notNull().default('draft'),
  deploymentStage: text("deployment_stage").default('sandbox'),
  projectId: varchar("project_id").references(() => projects.id),
  ownerId: varchar("owner_id").references(() => users.id),
  version: text("version").notNull().default('1.0.0'),
  channels: text("channels").array(),
  isActive: boolean("is_active").notNull().default(false),
  lastTestAt: timestamp("last_test_at"),
  lastDeployAt: timestamp("last_deploy_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const botDeployments = pgTable("bot_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instanceId: varchar("instance_id").notNull().references(() => botInstances.id),
  version: text("version").notNull(),
  stage: text("stage").notNull(),
  status: text("status").notNull().default('pending'),
  canaryPercent: integer("canary_percent").default(0),
  deployedBy: varchar("deployed_by").references(() => users.id),
  manifest: text("manifest").notNull(),
  rollbackFromId: varchar("rollback_from_id"),
  metrics: text("metrics"),
  notes: text("notes"),
  deployedAt: timestamp("deployed_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const botTestCases = pgTable("bot_test_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instanceId: varchar("instance_id").references(() => botInstances.id),
  templateId: varchar("template_id").references(() => botTemplates.id),
  name: text("name").notNull(),
  description: text("description"),
  userInput: text("user_input").notNull(),
  expectedOutput: text("expected_output"),
  expectedIntent: text("expected_intent"),
  testType: text("test_type").notNull().default('unit'),
  status: text("status").default('pending'),
  actualOutput: text("actual_output"),
  passed: boolean("passed"),
  executionTime: integer("execution_time"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

export const insertTelegramUserSchema = createInsertSchema(telegramUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServerCommandSchema = createInsertSchema(serverCommands).omit({
  id: true,
  createdAt: true,
});

export const insertBotTemplateSchema = createInsertSchema(botTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
}).extend({
  manifest: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      botManifestSchema.parse(parsed);
      return true;
    } catch {
      return false;
    }
  }, { message: "Manifest must be a valid Bot Manifest JSON conforming to botManifestSchema" }),
});

export const insertBotInstanceSchema = createInsertSchema(botInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTestAt: true,
  lastDeployAt: true,
}).extend({
  manifest: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      botManifestSchema.parse(parsed);
      return true;
    } catch {
      return false;
    }
  }, { message: "Manifest must be a valid Bot Manifest JSON conforming to botManifestSchema" }),
  status: z.enum(['draft', 'testing', 'active', 'paused', 'archived']).default('draft'),
  deploymentStage: z.enum(['sandbox', 'canary', 'staging', 'production']).optional(),
});

export const insertBotDeploymentSchema = createInsertSchema(botDeployments).omit({
  id: true,
  deployedAt: true,
  completedAt: true,
}).extend({
  manifest: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      botManifestSchema.parse(parsed);
      return true;
    } catch {
      return false;
    }
  }, { message: "Manifest must be a valid Bot Manifest JSON conforming to botManifestSchema" }),
  stage: z.enum(['sandbox', 'canary', 'staging', 'production']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'rolled_back']).default('pending'),
});

export const insertBotTestCaseSchema = createInsertSchema(botTestCases).omit({
  id: true,
  createdAt: true,
  lastRunAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type TelegramUser = typeof telegramUsers.$inferSelect;
export type InsertTelegramUser = z.infer<typeof insertTelegramUserSchema>;
export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;
export type ServerCommand = typeof serverCommands.$inferSelect;
export type InsertServerCommand = z.infer<typeof insertServerCommandSchema>;
export type BotTemplate = typeof botTemplates.$inferSelect;
export type InsertBotTemplate = z.infer<typeof insertBotTemplateSchema>;
export type BotInstance = typeof botInstances.$inferSelect;
export type InsertBotInstance = z.infer<typeof insertBotInstanceSchema>;
export type BotDeployment = typeof botDeployments.$inferSelect;
export type InsertBotDeployment = z.infer<typeof insertBotDeploymentSchema>;
export type BotTestCase = typeof botTestCases.$inferSelect;
export type InsertBotTestCase = z.infer<typeof insertBotTestCaseSchema>;

// AI Executive Agent vMax Tables
export const executiveCommands = pgTable("executive_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  command: text("command").notNull(),
  intent: text("intent"),
  priority: text("priority").notNull().default('medium'),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  estimatedCostSar: decimal("estimated_cost_sar", { precision: 10, scale: 2 }),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const executionPlans = pgTable("execution_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commandId: varchar("command_id").references(() => executiveCommands.id),
  steps: text("steps").notNull(), // JSON array of execution steps
  estimatedDurationMinutes: integer("estimated_duration_minutes").notNull(),
  estimatedCostSar: decimal("estimated_cost_sar", { precision: 10, scale: 2 }).notNull(),
  risks: text("risks").notNull(), // JSON array of risks
  requiresApproval: boolean("requires_approval").notNull().default(false),
  approvalReason: text("approval_reason"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const decisionLog = pgTable("decision_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  decisionType: text("decision_type").notNull(),
  commandId: varchar("command_id"),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  approvalRequired: boolean("approval_required").notNull().default(false),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  executed: boolean("executed").notNull().default(false),
  result: text("result"), // 'success', 'failure', 'rollback'
  metadata: text("metadata").notNull(), // JSON object
  immutableHash: text("immutable_hash").notNull(), // SHA-256 hash for integrity
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentMemories = pgTable("agent_memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'conversation', 'preference', 'fact', 'decision', 'learning'
  content: text("content").notNull(),
  metadata: text("metadata").notNull().default('{}'), // JSON object
  importance: integer("importance").notNull().default(5), // 1-10
  embedding: text("embedding"), // Vector embedding for similarity search (JSON array)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas for AI Executive Agent
export const insertExecutiveCommandSchema = createInsertSchema(executiveCommands).omit({
  id: true,
  createdAt: true,
});

export const insertExecutionPlanSchema = createInsertSchema(executionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertDecisionLogSchema = createInsertSchema(decisionLog).omit({
  id: true,
  createdAt: true,
});

export const insertAgentMemorySchema = createInsertSchema(agentMemories).omit({
  id: true,
  createdAt: true,
});

// Types for AI Executive Agent
export type ExecutiveCommand = typeof executiveCommands.$inferSelect;
export type InsertExecutiveCommand = z.infer<typeof insertExecutiveCommandSchema>;
export type ExecutionPlan = typeof executionPlans.$inferSelect;
export type InsertExecutionPlan = z.infer<typeof insertExecutionPlanSchema>;
export type DecisionLog = typeof decisionLog.$inferSelect;
export type InsertDecisionLog = z.infer<typeof insertDecisionLogSchema>;
export type AgentMemory = typeof agentMemories.$inferSelect;
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;

// Contact Form Schema (for client interface - no database storage)
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactForm = z.infer<typeof contactFormSchema>;
