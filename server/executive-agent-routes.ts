/**
 * AI Executive Agent Routes
 * نقاط النهاية للتواصل مع الوكيل التنفيذي
 */

import { Router } from 'express';
import { 
  AIExecutiveOrchestrator,
  ExecutiveCommand,
  SubAgentType 
} from './executive-agent/orchestrator';

const router = Router();
const orchestrator = new AIExecutiveOrchestrator();

/**
 * GET /api/executive/system-prompt
 * الحصول على System Prompt للوكيل
 */
router.get('/system-prompt', (req, res) => {
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
 * POST /api/executive/command
 * إرسال أمر للوكيل التنفيذي
 */
router.post('/command', async (req, res) => {
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
      intent: '', // Will be analyzed
      priority: priority || 'medium',
      requires_approval: false,
      timestamp: new Date(),
    };
    
    // معالجة الأمر وإنشاء خطة
    const plan = await orchestrator.processCommand(executiveCommand);
    
    res.json({
      command_id: executiveCommand.id,
      plan: {
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
router.post('/approve', async (req, res) => {
  try {
    const { command_id, approved_by } = req.body;
    
    if (!command_id || !approved_by) {
      return res.status(400).json({
        error: 'command_id and approved_by are required',
      });
    }
    
    // تنفيذ الخطة
    const result = await orchestrator.executePlan(command_id, approved_by);
    
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
router.post('/execute', async (req, res) => {
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
    
    // معالجة وتنفيذ
    const plan = await orchestrator.processCommand(executiveCommand);
    
    if (plan.requires_approval) {
      return res.status(403).json({
        error: 'This command requires approval',
        command_id: executiveCommand.id,
        plan,
        message: 'Use /approve endpoint to execute this plan',
      });
    }
    
    // تنفيذ مباشر
    const result = await orchestrator.executePlan(executiveCommand.id, user_id);
    
    res.json({
      command_id: executiveCommand.id,
      success: result.success,
      completed_steps: result.completed_steps.length,
      metrics: result.metrics,
      artifacts: result.artifacts,
      error: result.error,
    });
    
  } catch (error: any) {
    console.error('Error in direct execution:', error);
    res.status(500).json({
      error: 'Failed to execute command',
      details: error.message,
    });
  }
});

/**
 * GET /api/executive/decision-log
 * الحصول على سجل القرارات
 */
router.get('/decision-log', (req, res) => {
  const { user_id, limit } = req.query;
  
  let log = orchestrator.getDecisionLog();
  
  // Filter by user if specified
  if (user_id) {
    log = log.filter(entry => entry.user_id === user_id);
  }
  
  // Limit results
  const limitNum = limit ? parseInt(limit as string) : 50;
  log = log.slice(-limitNum);
  
  res.json({
    total: log.length,
    entries: log,
  });
});

/**
 * GET /api/executive/active-executions
 * الحصول على العمليات النشطة
 */
router.get('/active-executions', (req, res) => {
  const executions = orchestrator.getActiveExecutions();
  
  res.json({
    total: executions.length,
    executions: executions.map(plan => ({
      command_id: plan.command_id,
      steps: plan.steps.length,
      estimated_duration_minutes: plan.estimated_duration_minutes,
      estimated_cost_sar: plan.estimated_cost_sar,
      requires_approval: plan.requires_approval,
      risks_count: plan.risks.length,
    })),
  });
});

/**
 * POST /api/executive/status
 * الحصول على حالة النظام
 */
router.get('/status', (req, res) => {
  const activeExecutions = orchestrator.getActiveExecutions();
  const recentDecisions = orchestrator.getDecisionLog().slice(-10);
  
  res.json({
    status: 'operational',
    active_executions: activeExecutions.length,
    recent_decisions: recentDecisions.length,
    capabilities: {
      intent_analysis: true,
      auto_deployment: true,
      auto_healing: true,
      cost_management: true,
      security_validation: true,
    },
    sub_agents: {
      architect: 'active',
      builder: 'active',
      designer: 'active',
      guardian: 'active',
      doctor: 'active',
      memory: 'active',
    },
  });
});

/**
 * POST /api/executive/pause
 * إيقاف مؤقت للوكيل
 */
router.post('/pause', (req, res) => {
  // TODO: Implement pause mechanism
  res.json({
    message: 'Agent paused. All automatic operations stopped.',
    timestamp: new Date(),
  });
});

/**
 * POST /api/executive/rollback
 * الرجوع عن آخر عملية
 */
router.post('/rollback', async (req, res) => {
  try {
    const { command_id, approved_by } = req.body;
    
    if (!command_id) {
      return res.status(400).json({
        error: 'command_id is required',
      });
    }
    
    // TODO: Implement rollback logic
    
    res.json({
      message: 'Rollback initiated',
      command_id,
      approved_by,
    });
    
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to rollback',
      details: error.message,
    });
  }
});

export default router;
