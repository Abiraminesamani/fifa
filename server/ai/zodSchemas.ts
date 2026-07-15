import { z } from 'zod';

// 1. Multilingual Fan Assistant Schema
export const fanAssistantZodSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
  suggestedRouteExplanation: z.string().optional(),
  quickFAQAnswers: z.array(z.string()).min(1, 'At least one FAQ bullet point is required'),
  suggestedLandmarks: z.array(z.string()).optional()
});

// 2. Emergency Decision Copilot Schema
export const emergencyCopilotZodSchema = z.object({
  incidentTitle: z.string().min(1, 'Incident title is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  action: z.string().min(1, 'Action recommendation is required'),
  why: z.string().min(1, 'Rationale explanation is required'),
  sopSteps: z.array(z.string().min(1)).min(1, 'At least one SOP step is required'),
  jumbotronMessage: z.string().min(1, 'Jumbotron screen alert text is required'),
  expectedImpact: z.string().min(1, 'Expected crowd or operations impact is required'),
  confidence: z.number().int().min(1).max(100)
});

// 3. Sustainability Advisor Schema
export const sustainabilityAdvisoryZodSchema = z.object({
  wastePrediction: z.string().min(1, 'Waste prediction is required'),
  alerts: z.array(z.string()).min(1, 'At least one alert is required'),
  efficiencySteps: z.array(z.string()).min(1, 'At least one efficiency directive is required'),
  expectedImpact: z.string().min(1, 'Expected resource impact is required'),
  confidence: z.number().int().min(1).max(100)
});

// 4. Daily Operations Briefing Schema
export const dailyBriefingZodSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  incidentLogAnalysis: z.string().min(1, 'Incident log analysis is required'),
  sustainabilityReport: z.string().min(1, 'Sustainability report is required'),
  fullMarkdownReport: z.string().min(1, 'Full markdown report is required')
});

// 5. AI Transit Coordinator Schema (New for Upgrade 6)
export const transitCoordinatorZodSchema = z.object({
  transitService: z.string().min(1, 'Service name is required'),
  statusSummary: z.string().min(1, 'Status summary is required'),
  actionRecommendation: z.string().min(1, 'Action is required'),
  rationale: z.string().min(1, 'Why details are required'),
  expectedImpact: z.string().min(1, 'Expected load shifting impact is required'),
  alternativeSop: z.string().min(1, 'Alternative SOP holding plan is required'),
  confidence: z.number().int().min(1).max(100),
  lastUpdateSecondsAgo: z.number().int().min(0)
});
