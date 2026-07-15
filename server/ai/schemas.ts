import { Schema, Type } from '@google/genai';

// Schema for Multilingual Fan Assistant
export const fanAssistantSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: 'The natural language helpful answer, translated to the user requested language.'
    },
    suggestedRouteExplanation: {
      type: Type.STRING,
      description: 'Optional. Direct description of accessibility shortcuts, elevators, quiet zones or transport.'
    },
    quickFAQAnswers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-3 short, bullet points for rapid reading.'
    },
    suggestedLandmarks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'IDs or names of relevant stadium pins (e.g., sec-101, rest-west-1b) related to the query.'
    }
  },
  required: ['answer', 'quickFAQAnswers']
};

// Schema for Emergency Decision Copilot
export const emergencyCopilotSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    incidentTitle: { type: Type.STRING },
    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
    action: { type: Type.STRING, description: 'The recommended course of action, e.g., "Temporarily redirect arrivals from Gate B to Gate D."' },
    why: { type: Type.STRING, description: 'Brief rationale behind this action.' },
    sopSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ordered list of Standard Operating Procedure steps for stadium personnel.'
    },
    jumbotronMessage: {
      type: Type.STRING,
      description: 'High-visibility advisory alert message suitable for immediate stadium screen takeover.'
    },
    expectedImpact: { type: Type.STRING, description: 'The calculated or projected workload reduction percentage (e.g. 20-25%).' },
    confidence: { type: Type.INTEGER, description: 'An evaluation confidence score between 1 and 100.' }
  },
  required: ['incidentTitle', 'severity', 'action', 'why', 'sopSteps', 'jumbotronMessage', 'expectedImpact', 'confidence']
};

// Schema for Sustainability Advisories
export const sustainabilityAdvisorySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    wastePrediction: {
      type: Type.STRING,
      description: 'Predictive forecast of waste, e.g. "Overflow hazard near Section 112 escalators within 20 mins."'
    },
    alerts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific warnings, e.g., ["Smart bin east approaching 91% capacity"].'
    },
    efficiencySteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 concrete resource efficiency tasks, e.g., ["Dispatch Waste Team 2 to food court", "Throttle floodlight power by 15%"].'
    },
    expectedImpact: {
      type: Type.STRING,
      description: 'Calculated efficiency benefit, e.g. "Reduce waste flow rate by 34%."'
    },
    confidence: { type: Type.INTEGER, description: 'Accuracy rating from 1 to 100.' }
  },
  required: ['wastePrediction', 'alerts', 'efficiencySteps', 'expectedImpact', 'confidence']
};

// Schema for Daily Operations Briefing
export const dailyBriefingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: 'A high-level executive summary of the stadium operations.' },
    incidentLogAnalysis: { type: Type.STRING, description: 'Brief analysis of severity patterns and key incidents resolved.' },
    sustainabilityReport: { type: Type.STRING, description: 'Summary of the Green AI telemetry savings.' },
    fullMarkdownReport: { type: Type.STRING, description: 'The detailed, structured official briefing document in markdown format.' }
  },
  required: ['summary', 'incidentLogAnalysis', 'sustainabilityReport', 'fullMarkdownReport']
};

// Schema for AI Transit Coordinator (New)
export const transitCoordinatorSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transitService: { type: Type.STRING },
    statusSummary: { type: Type.STRING },
    actionRecommendation: { type: Type.STRING },
    rationale: { type: Type.STRING },
    expectedImpact: { type: Type.STRING },
    alternativeSop: { type: Type.STRING },
    confidence: { type: Type.INTEGER },
    lastUpdateSecondsAgo: { type: Type.INTEGER }
  },
  required: ['transitService', 'statusSummary', 'actionRecommendation', 'rationale', 'expectedImpact', 'alternativeSop', 'confidence', 'lastUpdateSecondsAgo']
};

