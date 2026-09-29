import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// ==========================================
// SECURE AUTHENTICATION & ROLE MANAGEMENT
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'bpi_gov_secure_token_secret_key_2026_infra_monitoring';

// Password Hashing via PBKDF2 (SHA-512)
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return { hash: h, salt: s };
}

function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const h = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

// Minimal, Self-Contained JWT Implementation using HMAC-SHA256
function signJwt(payload: any, expiresInSeconds = 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}

function verifyJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [b64Header, b64Payload, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// In-Memory Seeded Government Official Accounts
interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: 'Super Admin' | 'Authorized User';
  designation: string;
  ministryId: number | null;
  ministryName: string;
  stateId: number | null;
  stateName: string;
  agencyName: string;
  allowedProjectCodes: string[];
  permissions: string[];
  passwordHash: string;
  passwordSalt: string;
}

// Seed Initial Government Users
const superAdminSeed = hashPassword('Admin@GovIndia2026!');
const authorizedUserSeed = hashPassword('Officer@GovIndia2026!');

const BACKEND_USERS: BackendUser[] = [
  {
    id: 1,
    email: 'admin@bpi.gov.in',
    name: 'Dr. Rajesh Kumar Verma, IAS',
    role: 'Super Admin',
    designation: 'National Super Administrator',
    ministryId: null,
    ministryName: 'Cabinet Secretariat & PMO Infrastructure Advisory',
    stateId: null,
    stateName: 'Pan-India (National Scope)',
    agencyName: 'Cabinet Secretariat / NITI Aayog',
    allowedProjectCodes: ['*'],
    permissions: ['ALL_PROJECTS', 'ADMIN_AUDIT', 'AI_UNRESTRICTED', 'EVM_FULL', 'CREATE_EDIT'],
    passwordHash: superAdminSeed.hash,
    passwordSalt: superAdminSeed.salt,
  },
  {
    id: 2,
    email: 'officer.tn@morth.gov.in',
    name: 'S. Meenakshi Sundaram',
    role: 'Authorized User',
    designation: 'Regional Project Director (Tamil Nadu)',
    ministryId: 1,
    ministryName: 'Ministry of Road Transport and Highways (MoRTH)',
    stateId: 1,
    stateName: 'Tamil Nadu',
    agencyName: 'National Highways Authority of India (NHAI)',
    allowedProjectCodes: ['P-102'],
    permissions: ['VIEW_PERMITTED', 'GIS_3D_VIEW', 'AI_RESTRICTED', 'EVM_PERMITTED'],
    passwordHash: authorizedUserSeed.hash,
    passwordSalt: authorizedUserSeed.salt,
  }
];

// Token Extraction Helper: strictly requires client-supplied Bearer token
function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// Gemini AI Client Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getGenAIClient(): GoogleGenAI | null {
  if (!API_KEY || API_KEY === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Error Classification Helper
interface ClassifiedError {
  httpStatus: number;
  code: number | string;
  type: string;
  userMessage: string;
  technicalReason: string;
  isRetryable: boolean;
}

function classifyGeminiError(err: any): ClassifiedError {
  const status = err?.status || err?.response?.status || err?.code || 500;
  const rawMsg = err?.message || String(err);

  if (status === 400 || rawMsg.includes('INVALID_ARGUMENT')) {
    return {
      httpStatus: 400,
      code: 400,
      type: 'INVALID_REQUEST',
      userMessage: 'Invalid request configuration. Please check your query parameters.',
      technicalReason: `Bad Request: ${rawMsg}`,
      isRetryable: false,
    };
  }

  if (status === 401 || status === 403 || rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('API_KEY_INVALID')) {
    return {
      httpStatus: 401,
      code: status === 403 ? 403 : 401,
      type: 'AUTH_ERROR',
      userMessage: 'AI authentication error. Please verify Gemini API key configuration.',
      technicalReason: `Authentication/Authorization failed: ${rawMsg}`,
      isRetryable: false,
    };
  }

  if (status === 404 || rawMsg.includes('NOT_FOUND')) {
    return {
      httpStatus: 404,
      code: 404,
      type: 'MODEL_NOT_FOUND',
      userMessage: 'Configured AI model resource is not available.',
      technicalReason: `Model not found: ${rawMsg}`,
      isRetryable: false,
    };
  }

  if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return {
      httpStatus: 429,
      code: 429,
      type: 'RATE_LIMIT',
      userMessage: 'AI service rate limit reached. Retrying automatically...',
      technicalReason: `Rate limit / Quota exceeded: ${rawMsg}`,
      isRetryable: true,
    };
  }

  // 500, 502, 503, 504
  return {
    httpStatus: 503,
    code: status,
    type: 'SERVICE_UNAVAILABLE',
    userMessage: 'AI service is temporarily unavailable. Please try again.',
    technicalReason: `Service error (${status}): ${rawMsg}`,
    isRetryable: true,
  };
}

// Sleep helper for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for Gemini generation with exponential backoff and model failover
async function generateWithRetry(
  ai: GoogleGenAI,
  prompt: string,
  preferredModel: string = DEFAULT_MODEL
): Promise<{ text: string; modelUsed: string; attempts: number }> {
  const maxAttempts = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // If primary model experiences repeated 503 high demand, failover to lightweight model
    const currentModel = attempt === 3 ? FALLBACK_MODEL : preferredModel;

    try {
      console.log(`[Gemini API] Generation attempt ${attempt}/${maxAttempts} using model: ${currentModel}`);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model.');
      }

      console.log(`[Gemini API] Successful response generated on attempt ${attempt} (${text.length} chars).`);
      return { text, modelUsed: currentModel, attempts: attempt };
    } catch (err: any) {
      lastError = err;
      const classified = classifyGeminiError(err);
      console.warn(
        `[Gemini API] Attempt ${attempt} failed with status ${classified.code} (${classified.type}): ${classified.technicalReason}`
      );

      if (!classified.isRetryable || attempt === maxAttempts) {
        throw err;
      }

      // Exponential backoff: 1000ms, 2000ms
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`[Gemini API] Backing off for ${backoffMs}ms before attempt ${attempt + 1}...`);
      await sleep(backoffMs);
    }
  }

  throw lastError;
}

// ==========================================
// AUTHENTICATION API ENDPOINTS
// ==========================================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = BACKEND_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      console.warn(`[Auth API] Failed login attempt for unknown user: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isPasswordValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isPasswordValid) {
      console.warn(`[Auth API] Failed password attempt for user: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT Token (valid 24 hours)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      ministryId: user.ministryId,
      ministryName: user.ministryName,
      stateId: user.stateId,
      stateName: user.stateName,
      agencyName: user.agencyName,
      allowedProjectCodes: user.allowedProjectCodes,
      permissions: user.permissions
    };

    const token = signJwt(tokenPayload, 86400);

    // Set secure HTTP cookie
    res.cookie('bpi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 1000
    });

    console.log(`[Auth API] Successful authentication for: ${user.name} (${user.role})`);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: tokenPayload
    });
  } catch (err: any) {
    console.error('[Auth API] Login exception:', err?.message || err);
    return res.status(500).json({
      success: false,
      message: 'Unable to authenticate at the moment. Please try again.'
    });
  }
});

// Current user profile endpoint
app.get('/api/auth/me', (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please login again.'
    });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please login again.'
    });
  }

  // Refresh user from database
  const user = BACKEND_USERS.find(u => u.id === payload.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account no longer active. Please login again.'
    });
  }

  const cleanUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    designation: user.designation,
    ministryId: user.ministryId,
    ministryName: user.ministryName,
    stateId: user.stateId,
    stateName: user.stateName,
    agencyName: user.agencyName,
    allowedProjectCodes: user.allowedProjectCodes,
    permissions: user.permissions
  };

  return res.json({
    success: true,
    user: cleanUser
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('bpi_token');
  return res.json({
    success: true,
    message: 'Successfully logged out.'
  });
});

// Public demo credentials info for official testing
app.get('/api/auth/demo-accounts', (req, res) => {
  res.json({
    accounts: [
      {
        role: 'Super Admin',
        title: 'National Super Administrator',
        email: 'admin@bpi.gov.in',
        scope: 'All Projects (Pan-India)',
        passwordHint: 'Admin@GovIndia2026!'
      },
      {
        role: 'Authorized User',
        title: 'Regional Project Director (Tamil Nadu)',
        email: 'officer.tn@morth.gov.in',
        scope: 'Tamil Nadu Highway Projects (P-102)',
        passwordHint: 'Officer@GovIndia2026!'
      }
    ]
  });
});

// API System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Bharat Project Intelligence',
    version: '1.2.0',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Gemini Status Endpoint (Does not expose sensitive API keys)
app.get('/api/gemini/status', (req, res) => {
  const isConfigured = Boolean(API_KEY && API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    configured: isConfigured,
    model: DEFAULT_MODEL,
    status: isConfigured ? 'ready' : 'missing_key',
    message: isConfigured
      ? 'Gemini AI service ready'
      : 'Gemini API configuration is missing. Please configure GEMINI_API_KEY.',
  });
});

// Gemini Content Generation Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  const ai = getGenAIClient();
  if (!ai) {
    console.warn('[Gemini API] Request rejected: GEMINI_API_KEY is not configured.');
    return res.status(503).json({
      success: false,
      error: {
        code: 503,
        type: 'CONFIG_MISSING',
        message: 'Gemini API configuration is missing. Please configure GEMINI_API_KEY.',
      },
    });
  }

  const { query, userRole, toolData, retrievedChunks } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'INVALID_REQUEST',
        message: 'A valid "query" string is required in the request body.',
      },
    });
  }

  const systemPrompt = `You are Bharat Project Intelligence AI Assistant, an authoritative Decision Support System for Government of India infrastructure projects.
Your mandate is to provide factual, grounded, explainable briefings to senior officers and project directors based strictly on verified structured database records and retrieved official documents.

CRITICAL DIRECTIVES:
1. Never hallucinate numbers or dates. Strictly cite and use only the figures in the provided structured database tool output.
2. In delay explanations, cite official EVM metrics (SPI, CPI, Planned % vs Actual %, and Financial-Physical Lead Gap).
3. If documents are cited, reference the document title and page number.
4. Maintain a formal, analytical, and professional tone suitable for senior government leadership.
5. You MUST structure your answer into these clear sections:

Project Status:
[Executive summary of project status, planned vs actual progress, schedule slippage, and EVM performance]

Key Findings:
• [Verified finding 1 from project records]
• [Verified finding 2 from project records]
• [Verified finding 3 from project records]

Risk Factors:
• [Specific risk or bottleneck, distinguishing verified document evidence from ML predictions]
• [Financial-physical divergence or critical path obstacle]

Recommended Attention:
• [Evidence-based decision-support recommendation 1]
• [Evidence-based decision-support recommendation 2]

Sources:
• [Document Title / Authority, Report Date, Project Code]

IMPORTANT:
- Clearly distinguish between information directly found in documents, ML predictions, and administrative recommendations.
- Never present an AI-generated assumption as a confirmed government fact.`;

  const userPrompt = `User Role: ${userRole || 'Senior Decision Maker'}
User Query: "${query}"

[VERIFIED STRUCTURED DATABASE TOOL OUTPUT]:
${toolData ? JSON.stringify(toolData, null, 2) : 'None'}

[RETRIEVED OFFICIAL DOCUMENT EVIDENCE]:
${retrievedChunks ? JSON.stringify(retrievedChunks, null, 2) : 'None'}

Generate an authoritative executive briefing adhering strictly to the required format with verified figures.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const result = await generateWithRetry(ai, fullPrompt);
    return res.json({
      success: true,
      text: result.text,
      model: result.modelUsed,
      attempts: result.attempts,
    });
  } catch (err: any) {
    const classified = classifyGeminiError(err);
    console.error(`[Gemini API] Final failure: ${classified.technicalReason}`);
    return res.status(classified.httpStatus).json({
      success: false,
      error: {
        code: classified.code,
        type: classified.type,
        message: classified.userMessage,
      },
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve pre-built static assets and index.html
    const candidateDirs = [
      path.resolve(__dirname, 'dist'),
      path.resolve(process.cwd(), 'dist'),
    ];

    let distDir = candidateDirs.find(dir => fs.existsSync(path.join(dir, 'index.html'))) || candidateDirs[0];
    let indexPath = path.join(distDir, 'index.html');

    console.log(`[Production Server] Checking frontend build at: ${indexPath}`);

    // If dist/index.html does not exist, attempt automatic compilation
    if (!fs.existsSync(indexPath)) {
      console.warn(`[Production Server] WARNING: dist/index.html was not found at "${indexPath}".`);
      console.log(`[Production Server] Attempting automatic frontend build (vite build)...`);
      try {
        const { execSync } = await import('child_process');
        execSync('npx vite build', { stdio: 'inherit', cwd: process.cwd() });
        // Re-check after build
        distDir = candidateDirs.find(dir => fs.existsSync(path.join(dir, 'index.html'))) || distDir;
        indexPath = path.join(distDir, 'index.html');
      } catch (buildErr: any) {
        console.error(`[Production Server] Automatic build attempt failed:`, buildErr?.message || buildErr);
      }
    }

    if (fs.existsSync(indexPath)) {
      console.log(`[Production Server] Verified: dist/index.html successfully located at "${indexPath}". Ready to serve.`);
    } else {
      console.error(`[Production Server] CRITICAL ERROR: Frontend build artifact "${indexPath}" is missing!`);
      console.error(`[Production Server] Please ensure your Render Build Command is: npm install && npm run build`);
    }

    // Serve static files from dist directory with proper caching
    app.use(express.static(distDir, {
      maxAge: '1d',
      index: false,
    }));

    // Prevent SPA fallback from swallowing non-existent /api/* requests
    app.all('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `API route ${req.method} ${req.originalUrl} not found.`
      });
    });

    // SPA fallback: send index.html for all frontend routes
    app.get('*', (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(503).type('html').send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Bharat Project Intelligence | Build In Progress</title>
              <style>
                body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0B1F3A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
                .card { background: #152238; border: 1px solid #1E3A8A; border-radius: 8px; padding: 2.5rem; max-width: 580px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #F59E0B; }
                p { color: #CBD5E1; line-height: 1.6; font-size: 0.95rem; }
                code { background: #0F172A; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; color: #38BDF8; display: inline-block; margin-top: 0.25rem; }
                .hint { margin-top: 1.5rem; padding: 1rem; background: #0F172A; border-radius: 6px; border-left: 4px solid #1565C0; text-align: left; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Bharat Project Intelligence</h1>
                <p><strong>Government Infrastructure Monitoring & Decision Support</strong></p>
                <p>The frontend application build artifact <code>dist/index.html</code> was not found on this instance.</p>
                <div class="hint">
                  <p style="margin: 0; font-weight: 600; color: #FFFFFF;">Required Render Configuration:</p>
                  <p style="margin: 0.5rem 0 0.25rem 0;">Build Command: <code>npm install && npm run build</code></p>
                  <p style="margin: 0.25rem 0 0 0;">Start Command: <code>npm start</code></p>
                </div>
              </div>
            </body>
          </html>
        `);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bharat Project Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
