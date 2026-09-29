/**
 * Bharat Project Intelligence - Gemini Decision Support Service
 * 
 * Communicates with the secure server-side Gemini API endpoint (/api/gemini/generate).
 * Never exposes API keys or imports GenAI SDK in the client bundle.
 */

export interface GeminiStatusResponse {
  configured: boolean;
  model: string;
  status: 'ready' | 'missing_key' | 'error';
  message?: string;
}

export interface GeminiGenerationResult {
  text: string;
  model: string;
  attempts: number;
}

let isConfiguredCache: boolean = true;
let modelNameCache: string = 'gemini-3.8-flash';

// Fetch backend status asynchronously
export async function checkGeminiStatus(): Promise<GeminiStatusResponse> {
  try {
    const res = await fetch('/api/gemini/status');
    if (!res.ok) {
      throw new Error(`Status check returned HTTP ${res.status}`);
    }
    const data: GeminiStatusResponse = await res.json();
    isConfiguredCache = Boolean(data.configured);
    if (data.model) {
      modelNameCache = data.model;
    }
    return data;
  } catch (err) {
    console.warn('[Gemini Service] Could not verify backend status:', err);
    return {
      configured: false,
      model: modelNameCache,
      status: 'error',
      message: 'Failed to communicate with AI server.'
    };
  }
}

// Initial status check
checkGeminiStatus().catch(() => {});

export function isGeminiConfigured(): boolean {
  return isConfiguredCache;
}

export function getActiveModelName(): string {
  return modelNameCache;
}

/**
 * Generate a grounded executive briefing via server-side Gemini API
 */
export async function generateGroundedAnswerWithGemini(
  query: string,
  userRole: string,
  toolData: any,
  retrievedChunks: any[]
): Promise<string | null> {
  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        userRole,
        toolData,
        retrievedChunks,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errorMsg = errJson?.error?.message || `HTTP ${response.status}: Generation failed`;
      console.warn(`[Gemini Service] Backend generation error (${response.status}):`, errorMsg);
      return null;
    }

    const data = await response.json();
    if (data.success && data.text) {
      if (data.model) {
        modelNameCache = data.model;
      }
      return data.text;
    }

    return null;
  } catch (err) {
    console.warn('[Gemini Service] Network failure contacting Gemini backend route:', err);
    return null;
  }
}
