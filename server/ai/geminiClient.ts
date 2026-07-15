import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiInstance: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-stadium',
        },
      },
    });
  }
  return aiInstance;
}

export function isApiKeyAvailable(): boolean {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return false; // Force offline mock fallback during test suites for speed and isolation
  }
  return !!process.env.GEMINI_API_KEY;
}
