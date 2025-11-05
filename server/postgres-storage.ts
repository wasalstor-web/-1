import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { eq, desc, and } from 'drizzle-orm';
import ws from 'ws';
import { hashPassword } from './utils/auth';
import {
  users,
  projects,
  conversations,
  categories,
  products,
  orders,
  orderItems,
  aiConversations,
  aiMessages,
  telegramUsers,
  servers,
  serverCommands,
  executiveCommands,
  executionPlans,
  decisionLog,
  agentMemories,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Conversation,
  type InsertConversation,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type AiConversation,
  type InsertAiConversation,
  type AiMessage,
  type InsertAiMessage,
  type TelegramUser,
  type InsertTelegramUser,
  type Server,
  type InsertServer,
  type ServerCommand,
  type InsertServerCommand,
  type ExecutiveCommand,
  type InsertExecutiveCommand,
  type ExecutionPlan,
  type InsertExecutionPlan,
  type DecisionLog,
  type InsertDecisionLog,
  type AgentMemory,
  type InsertAgentMemory,
} from '@shared/schema';
import type { IStorage } from './storage';

// Enable WebSocket for local development
neonConfig.webSocketConstructor = ws;

export class PostgresStorage implements IStorage {
  private db;

  constructor(databaseUrl: string) {
    const pool = new Pool({ connectionString: databaseUrl });
    this.db = drizzle(pool);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(user.password);
    const result = await this.db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return await this.db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await this.db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Conversation methods
  async getConversationsByProject(projectId: string): Promise<Conversation[]> {
    return await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.projectId, projectId))
      .orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await this.db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await this.db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await this.db.delete(conversations).where(eq(conversations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await this.db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .orderBy(desc(products.totalSales))
      .limit(6);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await this.db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  // Order methods
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await this.db.insert(orders).values(order).returning();
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await this.db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // AI Conversation methods
  async getAllAiConversations(userId?: string): Promise<AiConversation[]> {
    if (userId) {
      return await this.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.userId, userId))
        .orderBy(desc(aiConversations.lastMessageAt));
    }
    return await this.db.select().from(aiConversations).orderBy(desc(aiConversations.lastMessageAt));
  }

  async getAiConversation(id: string): Promise<AiConversation | undefined> {
    const result = await this.db.select().from(aiConversations).where(eq(aiConversations.id, id)).limit(1);
    return result[0];
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const result = await this.db.insert(aiConversations).values(conversation).returning();
    return result[0];
  }

  async updateAiConversation(id: string, updates: Partial<InsertAiConversation>): Promise<AiConversation | undefined> {
    const result = await this.db
      .update(aiConversations)
      .set({ ...updates, lastMessageAt: new Date() })
      .where(eq(aiConversations.id, id))
      .returning();
    return result[0];
  }

  async deleteAiConversation(id: string): Promise<boolean> {
    await this.db.delete(aiMessages).where(eq(aiMessages.conversationId, id));
    const result = await this.db.delete(aiConversations).where(eq(aiConversations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // AI Message methods
  async getMessagesByConversation(conversationId: string): Promise<AiMessage[]> {
    return await this.db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(aiMessages.createdAt);
  }

  async createAiMessage(message: InsertAiMessage): Promise<AiMessage> {
    const result = await this.db.insert(aiMessages).values(message).returning();
    
    // Update conversation's lastMessageAt
    await this.updateAiConversation(message.conversationId, {});
    
    return result[0];
  }

  // Telegram User methods
  async getTelegramUser(telegramUserId: number): Promise<TelegramUser | undefined> {
    const result = await this.db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramUserId, telegramUserId))
      .limit(1);
    return result[0];
  }

  async createTelegramUser(user: InsertTelegramUser): Promise<TelegramUser> {
    const result = await this.db.insert(telegramUsers).values(user).returning();
    return result[0];
  }

  async updateTelegramUser(telegramUserId: number, updates: Partial<InsertTelegramUser>): Promise<TelegramUser | undefined> {
    const result = await this.db
      .update(telegramUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(telegramUsers.telegramUserId, telegramUserId))
      .returning();
    return result[0];
  }

  // Server methods
  async getAllServers(): Promise<Server[]> {
    return await this.db.select().from(servers);
  }

  async getServer(id: string): Promise<Server | undefined> {
    const result = await this.db.select().from(servers).where(eq(servers.id, id)).limit(1);
    return result[0];
  }

  async createServer(server: InsertServer): Promise<Server> {
    const result = await this.db.insert(servers).values(server).returning();
    return result[0];
  }

  async updateServerPing(id: string): Promise<void> {
    await this.db
      .update(servers)
      .set({ lastPing: new Date(), updatedAt: new Date() })
      .where(eq(servers.id, id));
  }

  async deleteServer(id: string): Promise<boolean> {
    const result = await this.db.delete(servers).where(eq(servers.id, id)).returning();
    return result.length > 0;
  }
  
  async createServerCommand(command: InsertServerCommand): Promise<ServerCommand> {
    const [cmd] = await this.db.insert(serverCommands).values(command).returning();
    return cmd;
  }
  
  async getPendingCommands(serverId: string): Promise<ServerCommand[]> {
    return await this.db
      .select()
      .from(serverCommands)
      .where(and(
        eq(serverCommands.serverId, serverId),
        eq(serverCommands.status, 'pending')
      ))
      .orderBy(serverCommands.createdAt);
  }

  async getServerCommandHistory(serverId: string, limit: number = 20): Promise<ServerCommand[]> {
    return await this.db
      .select()
      .from(serverCommands)
      .where(and(
        eq(serverCommands.serverId, serverId),
        eq(serverCommands.status, 'completed')
      ))
      .orderBy(desc(serverCommands.executedAt))
      .limit(limit);
  }
  
  async completeServerCommand(commandId: string, result: string, exitCode: number): Promise<void> {
    await this.db
      .update(serverCommands)
      .set({ 
        status: 'completed',
        result,
        exitCode,
        executedAt: new Date()
      })
      .where(eq(serverCommands.id, commandId));
  }

  // AI Executive Agent methods
  async createExecutiveCommand(command: InsertExecutiveCommand): Promise<ExecutiveCommand> {
    try {
      const [created] = await this.db.insert(executiveCommands).values(command).returning();
      return created;
    } catch (error) {
      console.error('Error creating executive command:', error);
      throw error;
    }
  }

  async getExecutiveCommand(id: string): Promise<ExecutiveCommand | undefined> {
    try {
      const result = await this.db.select().from(executiveCommands).where(eq(executiveCommands.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting executive command:', error);
      throw error;
    }
  }

  async getExecutiveCommandsByUser(userId: string): Promise<ExecutiveCommand[]> {
    try {
      return await this.db
        .select()
        .from(executiveCommands)
        .where(eq(executiveCommands.userId, userId))
        .orderBy(desc(executiveCommands.createdAt));
    } catch (error) {
      console.error('Error getting executive commands by user:', error);
      throw error;
    }
  }

  async getPendingExecutiveCommands(): Promise<ExecutiveCommand[]> {
    try {
      return await this.db
        .select()
        .from(executiveCommands)
        .where(eq(executiveCommands.status, 'pending'))
        .orderBy(executiveCommands.createdAt);
    } catch (error) {
      console.error('Error getting pending executive commands:', error);
      throw error;
    }
  }

  async updateExecutiveCommandStatus(id: string, status: string): Promise<void> {
    try {
      await this.db
        .update(executiveCommands)
        .set({ status })
        .where(eq(executiveCommands.id, id));
    } catch (error) {
      console.error('Error updating executive command status:', error);
      throw error;
    }
  }

  async createExecutionPlan(plan: InsertExecutionPlan): Promise<ExecutionPlan> {
    try {
      const [created] = await this.db.insert(executionPlans).values(plan).returning();
      return created;
    } catch (error) {
      console.error('Error creating execution plan:', error);
      throw error;
    }
  }

  async getExecutionPlan(id: string): Promise<ExecutionPlan | undefined> {
    try {
      const result = await this.db.select().from(executionPlans).where(eq(executionPlans.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting execution plan:', error);
      throw error;
    }
  }

  async getExecutionPlanByCommand(commandId: string): Promise<ExecutionPlan | undefined> {
    try {
      const result = await this.db
        .select()
        .from(executionPlans)
        .where(eq(executionPlans.commandId, commandId))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting execution plan by command:', error);
      throw error;
    }
  }

  async updateExecutionPlanApproval(id: string, approvedBy: string): Promise<void> {
    try {
      await this.db
        .update(executionPlans)
        .set({ 
          approvedBy,
          approvedAt: new Date()
        })
        .where(eq(executionPlans.id, id));
    } catch (error) {
      console.error('Error updating execution plan approval:', error);
      throw error;
    }
  }

  async createDecisionLog(log: InsertDecisionLog): Promise<DecisionLog> {
    try {
      const [created] = await this.db.insert(decisionLog).values(log).returning();
      return created;
    } catch (error) {
      console.error('Error creating decision log:', error);
      throw error;
    }
  }

  async getDecisionLog(id: string): Promise<DecisionLog | undefined> {
    try {
      const result = await this.db.select().from(decisionLog).where(eq(decisionLog.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting decision log:', error);
      throw error;
    }
  }

  async getAllDecisionLogs(limit?: number): Promise<DecisionLog[]> {
    try {
      const query = this.db
        .select()
        .from(decisionLog)
        .orderBy(desc(decisionLog.createdAt));
      
      if (limit) {
        return await query.limit(limit);
      }
      return await query;
    } catch (error) {
      console.error('Error getting all decision logs:', error);
      throw error;
    }
  }

  async getDecisionLogsByUser(userId: string): Promise<DecisionLog[]> {
    try {
      return await this.db
        .select()
        .from(decisionLog)
        .where(eq(decisionLog.userId, userId))
        .orderBy(desc(decisionLog.createdAt));
    } catch (error) {
      console.error('Error getting decision logs by user:', error);
      throw error;
    }
  }

  async createAgentMemory(memory: InsertAgentMemory): Promise<AgentMemory> {
    try {
      const [created] = await this.db.insert(agentMemories).values(memory).returning();
      return created;
    } catch (error) {
      console.error('Error creating agent memory:', error);
      throw error;
    }
  }

  async getAgentMemory(id: string): Promise<AgentMemory | undefined> {
    try {
      const result = await this.db.select().from(agentMemories).where(eq(agentMemories.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting agent memory:', error);
      throw error;
    }
  }

  async getAgentMemoriesByUser(userId: string, limit?: number): Promise<AgentMemory[]> {
    try {
      const query = this.db
        .select()
        .from(agentMemories)
        .where(eq(agentMemories.userId, userId))
        .orderBy(desc(agentMemories.createdAt));
      
      if (limit) {
        return await query.limit(limit);
      }
      return await query;
    } catch (error) {
      console.error('Error getting agent memories by user:', error);
      throw error;
    }
  }

  async getRecentAgentMemories(userId: string, limit: number): Promise<AgentMemory[]> {
    try {
      return await this.db
        .select()
        .from(agentMemories)
        .where(eq(agentMemories.userId, userId))
        .orderBy(desc(agentMemories.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent agent memories:', error);
      throw error;
    }
  }
}
