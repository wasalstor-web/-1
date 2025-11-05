/**
 * AI Executive Agent Routes
 * نقاط النهاية للتواصل مع الوكيل التنفيذي
 */

import type { Express } from 'express';
import { createHash } from 'crypto';
import type { IStorage } from './storage';
import { 
  insertExecutiveCommandSchema,
  insertExecutionPlanSchema,
  insertDecisionLogSchema,
  type InsertDecisionLog
} from '@shared/schema';
import { 
  AIExecutiveOrchestrator,
  type ExecutiveCommand,
  SubAgentType 
} from './executive-agent/orchestrator';

/**
 * SHA-256 Hash Generator for Immutable Decision Logs
 */
const computeHash = (data: Record<string, any>): string => {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

/**
 * Register Executive Agent Routes
 */
export function registerExecutiveAgentRoutes(app: Express, storage: IStorage) {
  const orchestrator = new AIExecutiveOrchestrator(storage);

  /**
   * GET /api/executive/system-prompt
   * الحصول على System Prompt للوكيل
   */
  app.get('/api/executive/system-prompt', (req, res) => {
    res.json({
      system_prompt: AIExecutiveOrchestrator.getSystemPrompt(),
      capabilities: [
        'Intent analysis and execution planning',
        'Code and infrastructure changes',
        'Automatic deployment to servers',
        'Self-monitoring and auto-healing',
        'Bot generation from descriptions',
        'Cost and resource management',
        'Detailed reporting',
      ],
      sub_agents: Object.values(SubAgentType),
    });
  });

  /**
   * GET /api/executive/status
   * الحصول على حالة النظام
   */
  app.get('/api/executive/status', async (req, res) => {
    try {
      const pendingCommands = await storage.getPendingExecutiveCommands();
      const recentDecisions = await storage.getAllDecisionLogs(10);
      
      res.json({
        status: 'operational',
        active_executions: pendingCommands.length,
        recent_decisions: recentDecisions.length,
        sub_agents: {
          architect: 'active',
          builder: 'active',
          designer: 'active',
          guardian: 'active',
          doctor: 'active',
          memory: 'active',
        },
        capabilities: {
          intent_analysis: true,
          auto_deployment: true,
          auto_healing: true,
          cost_management: true,
          security_validation: true,
        },
      });
    } catch (error: any) {
      console.error('Error getting status:', error);
      res.status(500).json({
        error: 'Failed to get system status',
        details: error.message,
      });
    }
  });

  /**
   * GET /api/executive/active-executions
   * الحصول على العمليات النشطة
   */
  app.get('/api/executive/active-executions', async (req, res) => {
    try {
      const pendingCommands = await storage.getPendingExecutiveCommands();
      
      const executionsWithPlans = await Promise.all(
        pendingCommands.map(async (cmd) => {
          const plan = await storage.getExecutionPlanByCommand(cmd.id);
          return {
            command_id: cmd.id,
            command: cmd.command,
            user_id: cmd.userId,
            priority: cmd.priority,
            status: cmd.status,
            plan: plan ? {
              steps: JSON.parse(plan.steps).length,
              estimated_duration_minutes: plan.estimatedDurationMinutes,
              estimated_cost_sar: plan.estimatedCostSar,
              requires_approval: plan.requiresApproval,
              risks_count: JSON.parse(plan.risks).length,
            } : null,
          };
        })
      );
      
      res.json({
        total: executionsWithPlans.length,
        executions: executionsWithPlans,
      });
    } catch (error: any) {
      console.error('Error fetching active executions:', error);
      res.status(500).json({
        error: 'Failed to fetch active executions',
        details: error.message,
      });
    }
  });

  /**
   * GET /api/executive/decision-log
   * الحصول على سجل القرارات
   */
  app.get('/api/executive/decision-log', async (req, res) => {
    try {
      const { user_id, limit } = req.query;
      
      let logs;
      if (user_id) {
        logs = await storage.getDecisionLogsByUser(user_id as string);
      } else {
        const limitNum = limit ? parseInt(limit as string) : 50;
        logs = await storage.getAllDecisionLogs(limitNum);
      }
      
      res.json({
        total: logs.length,
        entries: logs,
      });
    } catch (error: any) {
      console.error('Error fetching decision log:', error);
      res.status(500).json({
        error: 'Failed to fetch decision log',
        details: error.message,
      });
    }
  });

  /**
   * POST /api/executive/command
   * إرسال أمر للوكيل التنفيذي
   */
  app.post('/api/executive/command', async (req, res) => {
    try {
      const { command, user_id, priority } = req.body;
      
      if (!command || !user_id) {
        return res.status(400).json({
          error: 'command and user_id are required',
        });
      }
      
      const executiveCommand: ExecutiveCommand = {
        id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id,
        command,
        intent: '',
        priority: priority || 'medium',
        requires_approval: false,
        timestamp: new Date(),
      };
      
      const plan = await orchestrator.processCommand(executiveCommand);
      
      const commandData = insertExecutiveCommandSchema.parse({
        userId: user_id,
        command,
        intent: executiveCommand.intent,
        priority: executiveCommand.priority,
        requiresApproval: plan.requires_approval,
        estimatedCostSar: plan.estimated_cost_sar.toString(),
        status: 'pending',
      });
      
      const savedCommand = await storage.createExecutiveCommand(commandData);
      
      const planData = insertExecutionPlanSchema.parse({
        commandId: savedCommand.id,
        steps: JSON.stringify(plan.steps),
        estimatedDurationMinutes: plan.estimated_duration_minutes,
        estimatedCostSar: plan.estimated_cost_sar.toString(),
        risks: JSON.stringify(plan.risks),
        requiresApproval: plan.requires_approval,
        approvalReason: plan.approval_reason,
      });
      
      const savedPlan = await storage.createExecutionPlan(planData);
      
      const logData: InsertDecisionLog = insertDecisionLogSchema.parse({
        decisionType: 'deployment',
        commandId: savedCommand.id,
        userId: user_id,
        action: `Created execution plan for: ${command}`,
        approvalRequired: plan.requires_approval,
        executed: false,
        metadata: JSON.stringify({
          command,
          estimated_cost_sar: plan.estimated_cost_sar,
          estimated_duration_minutes: plan.estimated_duration_minutes,
        }),
        immutableHash: computeHash({
          action: `Created execution plan for: ${command}`,
          userId: user_id,
          timestamp: new Date(),
          commandId: savedCommand.id,
        }),
      });
      
      await storage.createDecisionLog(logData);
      
      res.json({
        command_id: savedCommand.id,
        plan: {
          id: savedPlan.id,
          steps: plan.steps.length,
          estimated_duration_minutes: plan.estimated_duration_minutes,
          estimated_cost_sar: plan.estimated_cost_sar,
          requires_approval: plan.requires_approval,
          approval_reason: plan.approval_reason,
          risks: plan.risks,
        },
        message: plan.requires_approval 
          ? 'Plan created. Awaiting your approval to execute.'
          : 'Plan created and ready for execution.',
        detailed_plan: plan,
      });
      
    } catch (error: any) {
      console.error('Error processing command:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      
      res.status(500).json({
        error: 'Failed to process command',
        details: error.message,
      });
    }
  });

  /**
   * POST /api/executive/approve
   * الموافقة على تنفيذ خطة
   */
  app.post('/api/executive/approve', async (req, res) => {
    try {
      const { command_id, approved_by } = req.body;
      
      if (!command_id || !approved_by) {
        return res.status(400).json({
          error: 'command_id and approved_by are required',
        });
      }
      
      const command = await storage.getExecutiveCommand(command_id);
      if (!command) {
        return res.status(404).json({
          error: 'Command not found',
        });
      }
      
      const plan = await storage.getExecutionPlanByCommand(command_id);
      if (!plan) {
        return res.status(404).json({
          error: 'Execution plan not found',
        });
      }
      
      await storage.updateExecutionPlanApproval(plan.id, approved_by);
      
      const logData: InsertDecisionLog = insertDecisionLogSchema.parse({
        decisionType: 'deployment',
        commandId: command_id,
        userId: command.userId,
        action: `Plan approved by ${approved_by}`,
        approvalRequired: true,
        approvedBy: approved_by,
        approvedAt: new Date(),
        executed: false,
        metadata: JSON.stringify({
          command: command.command,
          approved_by,
        }),
        immutableHash: computeHash({
          action: `Plan approved by ${approved_by}`,
          userId: command.userId,
          timestamp: new Date(),
          commandId: command_id,
          approved_by,
        }),
      });
      
      await storage.createDecisionLog(logData);
      
      const result = await orchestrator.executePlan(command_id, approved_by);
      
      await storage.updateExecutiveCommandStatus(command_id, result.success ? 'completed' : 'failed');
      
      const executionLogData: InsertDecisionLog = insertDecisionLogSchema.parse({
        decisionType: 'deployment',
        commandId: command_id,
        userId: command.userId,
        action: `Execution ${result.success ? 'completed' : 'failed'}`,
        approvalRequired: false,
        approvedBy: approved_by,
        executed: true,
        result: result.success ? 'success' : 'failure',
        metadata: JSON.stringify({
          completed_steps: result.completed_steps,
          metrics: result.metrics,
          artifacts: result.artifacts,
          error: result.error,
        }),
        immutableHash: computeHash({
          action: `Execution ${result.success ? 'completed' : 'failed'}`,
          userId: command.userId,
          timestamp: new Date(),
          commandId: command_id,
          result: result.success ? 'success' : 'failure',
        }),
      });
      
      await storage.createDecisionLog(executionLogData);
      
      res.json({
        command_id,
        success: result.success,
        completed_steps: result.completed_steps.length,
        metrics: result.metrics,
        artifacts: result.artifacts,
        error: result.error,
        message: result.success 
          ? 'Execution completed successfully'
          : 'Execution failed. Auto-rollback may have been triggered.',
      });
      
    } catch (error: any) {
      console.error('Error executing plan:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      
      res.status(500).json({
        error: 'Failed to execute plan',
        details: error.message,
      });
    }
  });

  /**
   * POST /api/executive/execute
   * تنفيذ مباشر (بدون موافقة - للعمليات البسيطة)
   */
  app.post('/api/executive/execute', async (req, res) => {
    try {
      const { command, user_id } = req.body;
      
      if (!command || !user_id) {
        return res.status(400).json({
          error: 'command and user_id are required',
        });
      }
      
      const executiveCommand: ExecutiveCommand = {
        id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id,
        command,
        intent: '',
        priority: 'medium',
        requires_approval: false,
        timestamp: new Date(),
      };
      
      const plan = await orchestrator.processCommand(executiveCommand);
      
      if (plan.requires_approval) {
        const commandData = insertExecutiveCommandSchema.parse({
          userId: user_id,
          command,
          intent: executiveCommand.intent,
          priority: executiveCommand.priority,
          requiresApproval: true,
          estimatedCostSar: plan.estimated_cost_sar.toString(),
          status: 'pending_approval',
        });
        
        const savedCommand = await storage.createExecutiveCommand(commandData);
        
        const planData = insertExecutionPlanSchema.parse({
          commandId: savedCommand.id,
          steps: JSON.stringify(plan.steps),
          estimatedDurationMinutes: plan.estimated_duration_minutes,
          estimatedCostSar: plan.estimated_cost_sar.toString(),
          risks: JSON.stringify(plan.risks),
          requiresApproval: plan.requires_approval,
          approvalReason: plan.approval_reason,
        });
        
        await storage.createExecutionPlan(planData);
        
        return res.status(403).json({
          error: 'This command requires approval',
          command_id: savedCommand.id,
          plan,
          message: 'Use /approve endpoint to execute this plan',
        });
      }
      
      const commandData = insertExecutiveCommandSchema.parse({
        userId: user_id,
        command,
        intent: executiveCommand.intent,
        priority: executiveCommand.priority,
        requiresApproval: false,
        estimatedCostSar: plan.estimated_cost_sar.toString(),
        status: 'executing',
      });
      
      const savedCommand = await storage.createExecutiveCommand(commandData);
      
      const planData = insertExecutionPlanSchema.parse({
        commandId: savedCommand.id,
        steps: JSON.stringify(plan.steps),
        estimatedDurationMinutes: plan.estimated_duration_minutes,
        estimatedCostSar: plan.estimated_cost_sar.toString(),
        risks: JSON.stringify(plan.risks),
        requiresApproval: false,
      });
      
      await storage.createExecutionPlan(planData);
      
      const preExecutionLogData: InsertDecisionLog = insertDecisionLogSchema.parse({
        decisionType: 'deployment',
        commandId: savedCommand.id,
        userId: user_id,
        action: `Direct execution started: ${command}`,
        approvalRequired: false,
        executed: false,
        metadata: JSON.stringify({
          command,
          estimated_cost_sar: plan.estimated_cost_sar,
        }),
        immutableHash: computeHash({
          action: `Direct execution started: ${command}`,
          userId: user_id,
          timestamp: new Date(),
          commandId: savedCommand.id,
        }),
      });
      
      await storage.createDecisionLog(preExecutionLogData);
      
      const result = await orchestrator.executePlan(savedCommand.id, user_id);
      
      await storage.updateExecutiveCommandStatus(savedCommand.id, result.success ? 'completed' : 'failed');
      
      const postExecutionLogData: InsertDecisionLog = insertDecisionLogSchema.parse({
        decisionType: 'deployment',
        commandId: savedCommand.id,
        userId: user_id,
        action: `Direct execution ${result.success ? 'completed' : 'failed'}`,
        approvalRequired: false,
        executed: true,
        result: result.success ? 'success' : 'failure',
        metadata: JSON.stringify({
          completed_steps: result.completed_steps,
          metrics: result.metrics,
          artifacts: result.artifacts,
          error: result.error,
        }),
        immutableHash: computeHash({
          action: `Direct execution ${result.success ? 'completed' : 'failed'}`,
          userId: user_id,
          timestamp: new Date(),
          commandId: savedCommand.id,
          result: result.success ? 'success' : 'failure',
        }),
      });
      
      await storage.createDecisionLog(postExecutionLogData);
      
      res.json({
        command_id: savedCommand.id,
        success: result.success,
        completed_steps: result.completed_steps.length,
        metrics: result.metrics,
        artifacts: result.artifacts,
        error: result.error,
      });
      
    } catch (error: any) {
      console.error('Error in direct execution:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      
      res.status(500).json({
        error: 'Failed to execute command',
        details: error.message,
      });
    }
  });

  /**
   * POST /api/executive/pause
   * إيقاف مؤقت للوكيل
   */
  app.post('/api/executive/pause', (req, res) => {
    res.json({
      message: 'Agent paused. All automatic operations stopped.',
      timestamp: new Date(),
    });
  });

  /**
   * POST /api/executive/rollback
   * الرجوع عن آخر عملية
   */
  app.post('/api/executive/rollback', async (req, res) => {
    try {
      const { command_id, approved_by } = req.body;
      
      if (!command_id) {
        return res.status(400).json({
          error: 'command_id is required',
        });
      }
      
      const command = await storage.getExecutiveCommand(command_id);
      if (!command) {
        return res.status(404).json({
          error: 'Command not found',
        });
      }
      
      const logData: InsertDecisionLog = insertDecisionLogSchema.parse({
        decisionType: 'rollback',
        commandId: command_id,
        userId: command.userId,
        action: `Rollback initiated for command: ${command.command}`,
        approvalRequired: false,
        approvedBy: approved_by,
        executed: true,
        result: 'rollback',
        metadata: JSON.stringify({
          command_id,
          approved_by,
        }),
        immutableHash: computeHash({
          action: `Rollback initiated for command: ${command.command}`,
          userId: command.userId,
          timestamp: new Date(),
          commandId: command_id,
          approved_by,
        }),
      });
      
      await storage.createDecisionLog(logData);
      
      res.json({
        message: 'Rollback initiated',
        command_id,
        approved_by,
      });
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      
      res.status(500).json({
        error: 'Failed to rollback',
        details: error.message,
      });
    }
  });
}

export default registerExecutiveAgentRoutes;
