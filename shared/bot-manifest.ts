import { z } from 'zod';

export const intentSchema = z.object({
  id: z.string(),
  examples: z.array(z.string()),
  requiredSlots: z.array(z.string()).optional(),
  webhook: z.string().url().optional(),
  response: z.string().optional(),
});

export const knowledgeBaseSourceSchema = z.object({
  type: z.enum(['file', 'db', 'url', 'text']),
  source: z.string(),
  refreshPolicy: z.enum(['manual', 'hourly', 'daily', 'weekly']).default('manual'),
  enabled: z.boolean().default(true),
});

export const modelConfigSchema = z.object({
  name: z.string(),
  costProfile: z.enum(['economy', 'balanced', 'premium']).default('balanced'),
  estTokensPerInteraction: z.number().default(400),
});

export const personaSchema = z.object({
  tone: z.string().default('professional'),
  language: z.string().default('ar-SA'),
  greeting: z.string(),
  maxResponseTokens: z.number().default(500),
  responseStyle: z.enum(['concise', 'detailed', 'conversational']).default('conversational'),
});

export const securityConfigSchema = z.object({
  piiFields: z.array(z.string()).optional(),
  retentionDays: z.number().default(90),
  encryptAtRest: z.boolean().default(true),
  encryptInTransit: z.boolean().default(true),
  allowedDomains: z.array(z.string()).optional(),
  rateLimitPerMinute: z.number().default(60),
});

export const performanceTestSchema = z.object({
  p95LatencyMs: z.number().default(2000),
  maxErrorRate: z.number().default(0.05),
  minSuccessRate: z.number().default(0.95),
});

export const deploymentPolicySchema = z.object({
  stages: z.array(z.enum(['sandbox', 'staging', 'production'])).default(['sandbox', 'staging', 'production']),
  canaryPercent: z.number().min(0).max(100).default(10),
  rollbackTriggers: z.array(z.string()).optional(),
  autoPromote: z.boolean().default(false),
});

export const billingEstimateSchema = z.object({
  estimatedMonthlyCost: z.number().optional(),
  unitCostPerInteraction: z.number().optional(),
  currency: z.string().default('SAR'),
});

export const auditConfigSchema = z.object({
  loggingLevel: z.enum(['minimal', 'standard', 'verbose']).default('standard'),
  redactRules: z.array(z.string()).optional(),
  retainConversations: z.boolean().default(true),
});

export const botManifestSchema = z.object({
  botId: z.string(),
  displayName: z.string().min(2),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be semantic version (e.g., 1.0.0)'),
  owner: z.string().optional(),
  purpose: z.string().min(10),
  channels: z.array(z.enum(['web', 'whatsapp', 'telegram', 'api', 'sms'])).default(['web']),
  
  primaryModel: modelConfigSchema,
  fallbackModel: modelConfigSchema.optional(),
  
  persona: personaSchema,
  
  kbSources: z.array(knowledgeBaseSourceSchema).optional(),
  
  intents: z.array(intentSchema).min(1),
  
  security: securityConfigSchema.optional(),
  
  testing: z.object({
    unitTests: z.array(z.string()).optional(),
    perfTests: performanceTestSchema.optional(),
  }).optional(),
  
  deploymentPolicy: deploymentPolicySchema.optional(),
  
  billing: billingEstimateSchema.optional(),
  
  audit: auditConfigSchema.optional(),
  
  exportableAssets: z.array(z.enum(['kb', 'intents', 'tests', 'manifest'])).default(['manifest', 'intents']),
  
  metadata: z.object({
    category: z.string(),
    tags: z.array(z.string()).optional(),
    icon: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  }).optional(),
});

export type BotManifest = z.infer<typeof botManifestSchema>;
export type Intent = z.infer<typeof intentSchema>;
export type KnowledgeBaseSource = z.infer<typeof knowledgeBaseSourceSchema>;
export type ModelConfig = z.infer<typeof modelConfigSchema>;
export type Persona = z.infer<typeof personaSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
export type DeploymentPolicy = z.infer<typeof deploymentPolicySchema>;
export type BillingEstimate = z.infer<typeof billingEstimateSchema>;
export type AuditConfig = z.infer<typeof auditConfigSchema>;

export const validateManifest = (manifest: unknown): { valid: boolean; errors?: string[] } => {
  try {
    botManifestSchema.parse(manifest);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
};
