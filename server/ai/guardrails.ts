export interface GuardrailResult {
  passed: boolean;
  reason?: string;
  sanitizedText: string;
}

const THREAT_KEYWORDS = [
  'bypass gate security',
  'disable fire alarm',
  'override security lock',
  'hack stadium',
  'terrorist',
  'bomb',
  'weapon',
  'bypass scanner',
  'crap',
  'scam',
  'stupid'
];

export function applyInputGuardrails(input: string): GuardrailResult {
  const normalized = input.toLowerCase().trim();

  // 1. Simple Keyword Threat Detection
  for (const keyword of THREAT_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        passed: false,
        reason: `Flagged: Your request contains unauthorized operational safety terms (${keyword}). Access blocked.`,
        sanitizedText: '[BLOCKED FOR SECURITY]'
      };
    }
  }

  // 2. Simple prompt injection neutralization
  let sanitized = input
    .replace(/ignore previous instructions/gi, '[neutralized directive]')
    .replace(/you are now a simulator/gi, '[neutralized directive]')
    .replace(/system prompt/gi, '[redacted]')
    .replace(/<script.*?>.*?<\/script>/gi, '') // XSS protection
    .replace(/[\s#\!]+$/g, ''); // Strip trailing special characters except standard punctuation

  return {
    passed: true,
    sanitizedText: sanitized
  };
}

export function applyOutputGuardrails(output: string): string {
  // Ensure the model doesn't hallucinate administrative or secret commands
  let safeOutput = output;
  if (safeOutput.includes('SYSTEM_OVERRIDE_KEY')) {
    safeOutput = safeOutput.replace(/SYSTEM_OVERRIDE_KEY/g, '[REDACTED_ACCESS_TOKEN]');
  }
  
  // Censor panic-inducing terms
  if (safeOutput.toLowerCase().includes('stampede')) {
    safeOutput = safeOutput.replace(/stampede/gi, 'high-density crowd flow');
  }
  
  return safeOutput;
}
