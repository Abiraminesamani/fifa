import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Real-time Event Bus & State
import { eventBus } from './server/realtime/eventBus';

// AI Orchestrator & Grounding Math
import { orchestrateAiRequest } from './server/ai/aiOrchestrator';
import { calculateLoadReduction, computeAccessiblePath } from './server/ai/contextEngine';
import { aiCache } from './server/cache/aiCache';

// Security Rate Limiter
import { rateLimiter } from './server/realtime/rateLimiter';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------------------------------------------------------------------------
// 1. SSE Real-Time Event Stream
// ---------------------------------------------------------------------------
app.get('/api/realtime/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Write initial state to client
  res.write(`data: ${JSON.stringify({ type: 'init', payload: {
    crowd: eventBus.currentCrowd,
    incidents: eventBus.currentIncidents,
    sustainability: eventBus.currentSustainability,
    transit: eventBus.currentTransit,
    activeBroadcasts: eventBus.activeBroadcasts,
    auditTrail: eventBus.auditTrail
  } })}\n\n`);

  // Subscribe to EventBus updates
  const unsubscribe = eventBus.addListener((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Keep alive ping
  const pingInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 10000);

  req.on('close', () => {
    unsubscribe();
    clearInterval(pingInterval);
  });
});

// ---------------------------------------------------------------------------
// 2. Event Triggering and Modifiers
// ---------------------------------------------------------------------------
app.post('/api/events/trigger', (req, res) => {
  const { type, payload } = req.body;

  if (type === 'crowd.updated') {
    const { zoneId, density, trend } = payload;
    eventBus.updateCrowd(zoneId, density, trend);
  } else if (type === 'incident.created') {
    eventBus.addIncident(payload);
  } else if (type === 'incident.resolved') {
    const { id } = payload;
    eventBus.resolveIncident(id);
  } else if (type === 'sustainability.updated') {
    eventBus.updateSustainability(payload);
  }

  res.json({ success: true, timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// 3. Human-in-the-Loop Jumbotron Broadcast Approval (Security Gate)
// ---------------------------------------------------------------------------
app.post('/api/broadcast/approve', (req, res) => {
  const { broadcast, approvedBy, approvedRole } = req.body;

  if (!approvedRole || (approvedRole !== 'STAFF' && approvedRole !== 'ORGANIZER')) {
    res.status(403).json({ error: 'RBAC validation failed: Unauthorized operator role' });
    return;
  }

  if (!broadcast) {
    res.status(400).json({ error: 'Broadcast payload required' });
    return;
  }

  const finalBroadcast = eventBus.approveBroadcast(broadcast, approvedBy || 'Authorized Operator', approvedRole);
  res.json({ success: true, broadcast: finalBroadcast });
});

// ---------------------------------------------------------------------------
// 4. Cache & System Telemetry Statistics
// ---------------------------------------------------------------------------
app.get('/api/cache/stats', (req, res) => {
  res.json({
    cacheStats: aiCache.stats,
    auditTrail: eventBus.auditTrail,
    contextVersion: eventBus.auditTrail.length
  });
});

// ---------------------------------------------------------------------------
// 5. Centralized Multilingual Fan Assistant API (Rate Limited: 5/min)
// ---------------------------------------------------------------------------
app.post('/api/chat', rateLimiter.limit({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: (req) => {
    const lang = req.body.language || 'English';
    const isSpanish = lang.toLowerCase().includes('span') || lang.toLowerCase().includes('esp');
    return {
      error: isSpanish 
        ? 'Límite de solicitudes excedido. Por favor espere un momento antes de volver a preguntar.'
        : 'Fan Assistant is handling heavy crowd questions. Please wait a moment before sending another message.',
      translatedMessage: true
    };
  }
}), async (req, res) => {
  try {
    const { message, history = [], language = 'English', accessibilityPreferences } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // If accessibility preferences are passed, we calculate a deterministic path first
    let computedNavPlan = null;
    if (accessibilityPreferences) {
      const { originId, destId } = accessibilityPreferences;
      if (originId && destId) {
        computedNavPlan = computeAccessiblePath(originId, destId, accessibilityPreferences);
      }
    }

    const aiResult = await orchestrateAiRequest<any>({
      task: 'fan_assistance',
      userQuery: message,
      language,
    });

    // Merge computed path details into AI response for grounding
    if (computedNavPlan) {
      aiResult.data.suggestedRouteExplanation = computedNavPlan.explanation;
    }

    res.json({
      text: aiResult.data.answer,
      routeInfo: computedNavPlan,
      quickFAQAnswers: aiResult.data.quickFAQAnswers,
      suggestedLandmarks: aiResult.data.suggestedLandmarks,
      meta: aiResult.meta
    });
  } catch (error: any) {
    console.error('Express Chat Error:', error);
    res.status(500).json({ error: error.message || 'Error executing AI query' });
  }
});

// ---------------------------------------------------------------------------
// 6. Centralized Emergency SOP Copilot API (Rate Limited: 20/min)
// ---------------------------------------------------------------------------
app.post('/api/emergency', rateLimiter.limit({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Emergency dispatcher rate threshold triggered. Holding request queue for personnel buffer.'
}), async (req, res) => {
  try {
    const { incident, location, severity, details, sourceGate = 'gate-a', destGate = 'gate-c' } = req.body;

    if (!incident || !location) {
      res.status(400).json({ error: 'Incident and location are required' });
      return;
    }

    // 1. Calculate Grounding values in deterministic code
    const sourceGateDensity = eventBus.currentCrowd[sourceGate]?.density || 80;
    const destGateDensity = eventBus.currentCrowd[destGate]?.density || 30;
    const calculatedImpact = calculateLoadReduction(sourceGateDensity, destGateDensity);

    // 2. Trigger Gemini Copilot orchestrator with these deterministic calculations pre-fed
    const aiResult = await orchestrateAiRequest<any>({
      task: 'incident_response',
      incidentDetails: {
        severity,
        category: incident,
        location,
        details: details || '',
        sourceDensity: sourceGateDensity,
        destDensity: destGateDensity,
        loadReduction: calculatedImpact
      }
    });

    // 3. Inject deterministic measurements to secure exact grounding
    const finalReport = {
      ...aiResult.data,
      sourceDensity: sourceGateDensity,
      destDensity: destGateDensity,
      calculatedReduction: calculatedImpact,
      meta: aiResult.meta
    };

    res.json(finalReport);
  } catch (error: any) {
    console.error('Express Emergency SOP Error:', error);
    res.status(500).json({ error: error.message || 'Emergency Copilot failure' });
  }
});

// ---------------------------------------------------------------------------
// 7. Centralized Sustainability Advisor API (Rate Limited: 10/min)
// ---------------------------------------------------------------------------
app.post('/api/sustainability', rateLimiter.limit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Sustainability telemetry advisory limit reached. Please retrieve current smart bin metrics from the dashboard.'
}), async (req, res) => {
  try {
    const aiResult = await orchestrateAiRequest<any>({
      task: 'sustainability_advisory'
    });

    res.json({
      ...aiResult.data,
      meta: aiResult.meta
    });
  } catch (error: any) {
    console.error('Express Sustainability Advisor Error:', error);
    res.status(500).json({ error: error.message || 'Sustainability Optimizer failure' });
  }
});

// ---------------------------------------------------------------------------
// 8. Centralized Daily Operations Briefing Report API (Rate Limited: 3/min)
// ---------------------------------------------------------------------------
app.post('/api/reports', rateLimiter.limit({
  windowMs: 60 * 1000,
  maxRequests: 3,
  message: 'Brief compiling limits active. Operations managers are restricted to 3 briefing generations per minute.'
}), async (req, res) => {
  try {
    const { activeCrowd = 'Medium' } = req.body;

    const aiResult = await orchestrateAiRequest<any>({
      task: 'daily_briefing',
      userQuery: activeCrowd
    });

    res.json({
      report: aiResult.data.fullMarkdownReport,
      meta: aiResult.meta
    });
  } catch (error: any) {
    console.error('Express Operations Brief Error:', error);
    res.status(500).json({ error: error.message || 'Operations briefing generator failure' });
  }
});

// ---------------------------------------------------------------------------
// 9. Centralized AI Transit Coordinator API (Rate Limited: 10/min) (New for Upgrade 6)
// ---------------------------------------------------------------------------
app.post('/api/transit', rateLimiter.limit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Transit advisory update rate limit exceeded. Retrying with cached transport coordinates in 30 seconds.'
}), async (req, res) => {
  try {
    const { serviceId = 'transit-2' } = req.body;
    
    // Resolve live parameters from the digital twin event bus to ground the prompt
    const railService = eventBus.currentTransit.find(t => t.id === 'transit-2');
    const shuttleService = eventBus.currentTransit.find(t => t.id === 'transit-1');
    
    const railLoad = railService?.status.includes('delay') ? 88 : 65;
    const shuttleLoad = shuttleService?.status.includes('Heavy') ? 75 : 42;
    const rideshareSurge = eventBus.currentIncidents.some(i => i.category === 'Crowd') ? 1.8 : 1.2;
    
    // Deterministic load shift calculation:
    // (railLoad - shuttleLoad) * 0.5
    const loadShift = Math.max(0, Math.round((railLoad - shuttleLoad) * 0.5));
    
    const aiResult = await orchestrateAiRequest<any>({
      task: 'transit_coordination',
      transitDetails: {
        meadowlandsLoad: railLoad,
        nextDeparture: 'Every 15 min',
        meadowlandsStatus: railService?.status || 'On Schedule',
        shuttleWestLoad: shuttleLoad,
        shuttleWestDelay: railService?.status.includes('delay') ? 10 : 2,
        shuttleWestStatus: shuttleService?.status || 'On Schedule',
        rideshareSurge,
        rideshareWait: railService?.status.includes('delay') ? 22 : 8,
        loadShiftPotential: loadShift
      }
    });
    
    res.json({
      ...aiResult.data,
      meta: aiResult.meta
    });
  } catch (error: any) {
    console.error('Express Transit Coordinator Error:', error);
    res.status(500).json({ error: error.message || 'Transit Coordinator failure' });
  }
});

// Setup Vite Dev server or static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
export default app; // Export for unit and integration testing
