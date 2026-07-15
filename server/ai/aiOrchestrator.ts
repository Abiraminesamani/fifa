import { getAiClient, isApiKeyAvailable } from './geminiClient';
import { buildStadiumContext, StadiumContext } from './contextEngine';
import { applyInputGuardrails, applyOutputGuardrails } from './guardrails';
import { aiCache } from '../cache/aiCache';
import { requestCoalescer } from '../cache/requestCoalescer';
import {
  STADIUM_SYSTEM_PROMPT,
  FAN_ASSISTANCE_PROMPT,
  EMERGENCY_COPILOT_PROMPT,
  SUSTAINABILITY_ADVISORY_PROMPT,
  DAILY_BRIEFING_PROMPT,
  TRANSIT_COORDINATOR_PROMPT
} from './prompts';
import {
  fanAssistantSchema,
  emergencyCopilotSchema,
  sustainabilityAdvisorySchema,
  dailyBriefingSchema,
  transitCoordinatorSchema
} from './schemas';
import {
  fanAssistantZodSchema,
  emergencyCopilotZodSchema,
  sustainabilityAdvisoryZodSchema,
  dailyBriefingZodSchema,
  transitCoordinatorZodSchema
} from './zodSchemas';
import eventBus from '../realtime/eventBus';

export interface PerformanceMetadata {
  model: string;
  latencyMs: number;
  cache: 'HIT' | 'MISS';
  contextVersion: number;
  schemaValid: 'YES' | 'NO';
}

export interface OrchestratorResult<T> {
  data: T;
  meta: PerformanceMetadata;
}

export async function orchestrateAiRequest<T>(params: {
  task: 'fan_assistance' | 'sustainability_advisory' | 'incident_response' | 'daily_briefing' | 'transit_coordination';
  userQuery?: string;
  language?: string;
  incidentDetails?: {
    severity: string;
    category: string;
    location: string;
    details: string;
    sourceDensity?: number;
    destDensity?: number;
    loadReduction?: number;
  };
  transitDetails?: {
    meadowlandsLoad: number;
    nextDeparture: string;
    meadowlandsStatus: string;
    shuttleWestLoad: number;
    shuttleWestDelay: number;
    shuttleWestStatus: string;
    rideshareSurge: number;
    rideshareWait: number;
    loadShiftPotential?: number;
  };
}): Promise<OrchestratorResult<T>> {
  const startTimestamp = Date.now();
  const contextVersion = eventBus.auditTrail.length;

  // 1. Gather live stadium context
  const stadiumContext = await buildStadiumContext();
  const contextJsonString = JSON.stringify(stadiumContext);

  // 2. Determine TTL based on task
  let ttlSeconds = 60;
  if (params.task === 'fan_assistance') ttlSeconds = 300;
  else if (params.task === 'sustainability_advisory') ttlSeconds = 60;
  else if (params.task === 'daily_briefing') ttlSeconds = 300;
  else if (params.task === 'transit_coordination') ttlSeconds = 120;
  else if (params.task === 'incident_response') ttlSeconds = 0; // SAFETY: Never cache emergency responses

  // 3. Resolve prompt and cache keys
  const userQueryText = params.userQuery || params.incidentDetails?.details || '';
  const lang = params.language || 'English';

  // Apply input guardrails
  const guardrailCheck = applyInputGuardrails(userQueryText);
  if (!guardrailCheck.passed) {
    throw new Error(guardrailCheck.reason);
  }

  const cacheKey = aiCache.generateKey(params.task, guardrailCheck.sanitizedText, lang, `${contextVersion}`);

  // 4. Try reading cache first
  const cachedData = aiCache.get<T>(cacheKey);
  if (cachedData) {
    const elapsed = Date.now() - startTimestamp;
    aiCache.recordHit(elapsed, aiCache.getAverageMissLatency());
    
    return {
      data: cachedData,
      meta: {
        model: 'Gemini 3.5 Flash',
        latencyMs: elapsed,
        cache: 'HIT',
        contextVersion,
        schemaValid: 'YES'
      }
    };
  }

  // 5. Coalesce concurrent in-flight requests to avoid redundant LLM calls
  const executeLlmCall = async (): Promise<T> => {
    if (!isApiKeyAvailable()) {
      return generateMockFallback(params.task, stadiumContext, params.incidentDetails, lang, params.transitDetails) as T;
    }

    const ai = getAiClient();
    
    // Select correct instruction prompt and response schema
    let systemInstruction = STADIUM_SYSTEM_PROMPT.replace('{STADIUM_CONTEXT}', contextJsonString);
    let promptText = '';
    let responseSchema: any = null;

    if (params.task === 'fan_assistance') {
      promptText = FAN_ASSISTANCE_PROMPT
        .replace('{USER_QUERY}', guardrailCheck.sanitizedText)
        .replace('{LANGUAGE}', lang);
      responseSchema = fanAssistantSchema;
    } else if (params.task === 'sustainability_advisory') {
      const maintenanceCount = stadiumContext.incidents.filter(i => i.category === 'Maintenance').length;
      const overflowRisk = stadiumContext.sustainability.binFullness > 75 ? 85 : 40;
      const energySavings = stadiumContext.sustainability.energyUsage > 1000 ? 15 : 5;

      promptText = SUSTAINABILITY_ADVISORY_PROMPT
        .replace('{WASTE_LEVEL}', stadiumContext.sustainability.wasteLevel.toString())
        .replace('{WATER_USAGE}', stadiumContext.sustainability.waterUsage.toString())
        .replace('{ENERGY_USAGE}', stadiumContext.sustainability.energyUsage.toString())
        .replace('{BIN_FULLNESS}', stadiumContext.sustainability.binFullness.toString())
        .replace('{MAINTENANCE_INCIDENTS_COUNT}', maintenanceCount.toString())
        .replace('{OVERFLOW_RISK}', overflowRisk.toString())
        .replace('{EFFICIENCY_SAVINGS}', energySavings.toString());
      responseSchema = sustainabilityAdvisorySchema;
    } else if (params.task === 'incident_response' && params.incidentDetails) {
      const det = params.incidentDetails;
      promptText = EMERGENCY_COPILOT_PROMPT
        .replace('{SEVERITY}', det.severity)
        .replace('{CATEGORY}', det.category)
        .replace('{LOCATION}', det.location)
        .replace('{DETAILS}', det.details)
        .replace('{SOURCE_DENSITY}', (det.sourceDensity ?? 80).toString())
        .replace('{DEST_DENSITY}', (det.destDensity ?? 30).toString())
        .replace('{LOAD_REDUCTION}', (det.loadReduction ?? 25).toString());
      responseSchema = emergencyCopilotSchema;
    } else if (params.task === 'transit_coordination' && params.transitDetails) {
      const td = params.transitDetails;
      promptText = TRANSIT_COORDINATOR_PROMPT
        .replace('{MEADOWLANDS_LOAD}', td.meadowlandsLoad.toString())
        .replace('{NEXT_DEPARTURE}', td.nextDeparture)
        .replace('{MEADOWLANDS_STATUS}', td.meadowlandsStatus)
        .replace('{SHUTTLE_WEST_LOAD}', td.shuttleWestLoad.toString())
        .replace('{SHUTTLE_WEST_DELAY}', td.shuttleWestDelay.toString())
        .replace('{SHUTTLE_WEST_STATUS}', td.shuttleWestStatus)
        .replace('{RIDESHARE_SURGE}', td.rideshareSurge.toString())
        .replace('{RIDESHARE_WAIT}', td.rideshareWait.toString())
        .replace('{LOAD_SHIFT_POTENTIAL}', (td.loadShiftPotential ?? 30).toString());
      responseSchema = transitCoordinatorSchema;
    } else {
      const activeLogsText = stadiumContext.incidents
        .map(i => `[${i.time}] ${i.category} in ${i.location} (Severity: ${i.severity}) - ${i.detail}`)
        .join('\n');

      promptText = DAILY_BRIEFING_PROMPT
        .replace('{ACTIVE_CROWD}', stadiumContext.venue.matchPhase)
        .replace('{SCANNED_RATIO}', stadiumContext.crowd.totalScannedRatio.toString())
        .replace('{ACTIVE_LOGS_COUNT}', stadiumContext.incidents.length.toString())
        .replace('{INCIDENT_LOGS_TEXT}', activeLogsText || 'No active incidents reported.');
      responseSchema = dailyBriefingSchema;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Empty response from Gemini server.');
    }

    const sanitizedOutput = applyOutputGuardrails(outputText);
    return JSON.parse(sanitizedOutput) as T;
  };

  try {
    const rawResult = await requestCoalescer.coalesce(cacheKey, executeLlmCall);
    const elapsed = Date.now() - startTimestamp;

    // Strict Zod schema contract validation
    let schemaValid: 'YES' | 'NO' = 'YES';
    let validatedResult = rawResult;

    try {
      if (params.task === 'fan_assistance') {
        fanAssistantZodSchema.parse(rawResult);
      } else if (params.task === 'incident_response') {
        emergencyCopilotZodSchema.parse(rawResult);
      } else if (params.task === 'sustainability_advisory') {
        sustainabilityAdvisoryZodSchema.parse(rawResult);
      } else if (params.task === 'daily_briefing') {
        dailyBriefingZodSchema.parse(rawResult);
      } else if (params.task === 'transit_coordination') {
        transitCoordinatorZodSchema.parse(rawResult);
      }
    } catch (zodError) {
      console.warn('Zod Schema Validation Failure:', zodError);
      schemaValid = 'NO';
      // Recovery fallback to prevent interface breakage if model violates the schema contract
      validatedResult = generateMockFallback(params.task, stadiumContext, params.incidentDetails, lang, params.transitDetails) as Awaited<T>;
    }

    // Save back to cache
    aiCache.set(cacheKey, validatedResult, ttlSeconds);
    aiCache.recordMiss(elapsed);

    return {
      data: validatedResult,
      meta: {
        model: 'Gemini 3.5 Flash',
        latencyMs: elapsed,
        cache: 'MISS',
        contextVersion,
        schemaValid
      }
    };
  } catch (error: any) {
    console.error('AI Orchestration Error, generating safe fallback:', error);
    const elapsed = Date.now() - startTimestamp;
    const fallback = generateMockFallback(params.task, stadiumContext, params.incidentDetails, lang, params.transitDetails) as T;
    return {
      data: fallback,
      meta: {
        model: 'Fallback Reasoning Layer',
        latencyMs: elapsed,
        cache: 'MISS',
        contextVersion,
        schemaValid: 'YES'
      }
    };
  }
}

// ---------------------------------------------------------------------------
// Robust Mock Fallbacks for Local Offline Use & Key-missing Environments
// ---------------------------------------------------------------------------
export function generateMockFallback(
  task: string,
  context: StadiumContext,
  incidentDetails: any,
  language: string,
  transitDetails?: any
): any {
  if (task === 'fan_assistance') {
    const isSpanish = language.toLowerCase().includes('span') || language.toLowerCase().includes('esp');
    return {
      answer: isSpanish
        ? 'Hola! Con gusto te ayudo con las ubicaciones e indicaciones de accesibilidad en MetLife Stadium. Las rutas sin escaleras están activas en el Sector Oeste.'
        : 'Welcome! I can provide directions, accessibility guidance, and vegan food coordinates inside MetLife Stadium. Our step-free corridors are active.',
      suggestedRouteExplanation: 'Use the central elevator adjacent to Gate B for level transitions.',
      quickFAQAnswers: [
        isSpanish ? '• Baños accesibles en la sección 112 y 140.' : '• Accessible restrooms at Section 112 & 140.',
        isSpanish ? '• Comida vegana disponible en el Concourse Oeste.' : '• Vegan food stands active on the West Concourse.',
        isSpanish ? '• Zona de baja estimulación sensorial en la Mezzanine 228.' : '• Low-sensory decompression zone located near Section 228.'
      ],
      suggestedLandmarks: ['sec-112', 'sec-140']
    };
  }

  if (task === 'sustainability_advisory') {
    return {
      wastePrediction: `Smart waste levels will reach maximum holding thresholds inside Section 112 within 18 minutes due to current pre-kickoff spectator movement.`,
      alerts: [
        `Smart bin level is currently at ${context.sustainability.binFullness}% capacity.`,
        `Water flow rate is operating at peak greywater circulation: ${context.sustainability.waterUsage} L/min.`
      ],
      efficiencySteps: [
        'Dispatch Waste routing team 2 to empty the bins at Concourse East.',
        'Engage high-efficiency recycling drive to activate Fan Reward tokens.',
        'Throttle floodlight illumination by 15% to leverage ambient twilight cooling.'
      ],
      expectedImpact: `Mitigate waste congestion by 34% and reduce electrical load by 120kW.`,
      confidence: 94
    };
  }

  if (task === 'incident_response' && incidentDetails) {
    const loadRed = Math.max(10, Math.round((incidentDetails.sourceDensity ?? 80) - (incidentDetails.destDensity ?? 30) * 0.4));
    return {
      incidentTitle: `${incidentDetails.category} Response Playbook`,
      severity: incidentDetails.severity,
      sourceDensity: incidentDetails.sourceDensity ?? 80,
      destDensity: incidentDetails.destDensity ?? 30,
      action: `Establish visual safety buffer and reroute incoming crowd movement around ${incidentDetails.location}.`,
      why: `The area in ${incidentDetails.location} is experiencing a ${incidentDetails.severity} severity ${incidentDetails.category} incident.`,
      sopSteps: [
        `[SOP-1] Deploy local Area Coordinator to ${incidentDetails.location} to verify visual status.`,
        `[SOP-2] Set up mobile perimeter safety barricades 15 meters out.`,
        `[SOP-3] Reroute incoming pedestrian flow from dense Gates into adjacent tranquil sections.`,
        `[SOP-4] Synchronize status changes with the Venue Security Director.`
      ],
      jumbotronMessage: `🚨 VISUAL ADVISORY: Please follow concourse stewards' guidance and bypass Section ${incidentDetails.location}. Re-route via secondary pathways.`,
      expectedImpact: `Potential ${loadRed}% crowd pressure reduction at localized sector.`,
      confidence: 92
    };
  }

  if (task === 'transit_coordination') {
    const td = transitDetails || {
      meadowlandsLoad: 85,
      nextDeparture: '10 mins',
      meadowlandsStatus: 'Delayed',
      shuttleWestLoad: 40,
      shuttleWestDelay: 2,
      shuttleWestStatus: 'On Schedule',
      rideshareSurge: 1.8,
      rideshareWait: 25,
      loadShiftPotential: 35
    };
    return {
      transitService: 'Meadowlands Rail Link & Shuttle West Bypass',
      statusSummary: `Rail Link is heavily loaded (${td.meadowlandsLoad}%), while Shuttle West has spare capacity (${td.shuttleWestLoad}%).`,
      actionRecommendation: 'Divert Level 1 East concourse departures toward Gate D Shuttle West platforms.',
      rationale: 'Shuttle West has an optimal 2-minute departure delay and 40% loading, providing a rapid bypass for transit commuters.',
      expectedImpact: `Redirecting 1,500 commuters achieves a ${td.loadShiftPotential ?? 35}% load reduction on rail platforms.`,
      alternativeSop: 'Hold incoming shuttle boarding for 4 minutes to create a buffer if rideshare loop surge exceeds 2.0x.',
      confidence: 95,
      lastUpdateSecondsAgo: 12
    };
  }

  // Fallback for daily brief
  return {
    summary: 'Executive Summary of Tournament Operations.',
    incidentLogAnalysis: `Successfully triaged and resolved multiple minor maintenance and crowd incidents across Gate B concourses.`,
    sustainabilityReport: `Recycling drives achieved a 45% container diversion rate with active greywater optimization.`,
    fullMarkdownReport: `### FIFA OFFICIAL BRIEFING REPORT
    **VENUE**: MetLife Stadium
    **MATCH STATUS**: ${context.venue.currentMatch}
    
    1. **Crowd Density Analysis**
    Gates are handling attendance loads smoothly. Peak flow recorded at Southern concourses.
    
    2. **Active Incident Summary**
    There are currently ${context.incidents.length} active issues logged in security channels. Triages are underway.
    
    3. **Sustainability Green Target Metrics**
    - Waste diversion: 4.8 tons collected
    - Energy load: ${context.sustainability.energyUsage} kW
    `
  };
}
