/**
 * Bharat Project Intelligence - Authentication Service
 * 
 * Provides client-side session management and communicates with /api/auth/* endpoints.
 * Uses sessionStorage to prevent stale persistence across new browser sessions.
 */

import { User } from '../types';

const TOKEN_KEY = 'bpi_session_token';

// Purge any legacy tokens from localStorage to ensure clean login state
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('bpi_auth_token');
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage access errors
  }
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface DemoAccountInfo {
  role: string;
  title: string;
  email: string;
  scope: string;
  passwordHint: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem('bpi_auth_token');
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to store session auth token:', err);
  }
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('bpi_auth_token');
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove session auth token:', err);
  }
}

/**
 * Authenticate against the backend authentication API
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data: AuthResponse = await res.json();

    if (res.ok && data.success && data.token) {
      setStoredToken(data.token);
      return data;
    }

    return {
      success: false,
      message: data.message || 'Invalid email or password.',
    };
  } catch (err) {
    console.error('[Auth Service] Login network error:', err);
    return {
      success: false,
      message: 'Unable to authenticate at the moment. Please try again.',
    };
  }
}

/**
 * Fetch authenticated user profile using active session token
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      removeStoredToken();
      return null;
    }

    const data = await res.json();
    if (data.success && data.user) {
      return data.user as User;
    }

    removeStoredToken();
    return null;
  } catch (err) {
    console.warn('[Auth Service] Session verification failed:', err);
    removeStoredToken();
    return null;
  }
}

/**
 * Log out and invalidate session
 */
export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    console.warn('[Auth Service] Logout notification failed:', err);
  } finally {
    removeStoredToken();
  }
}

/**
 * Fetch list of official test credentials for evaluation
 */
export async function fetchDemoAccounts(): Promise<DemoAccountInfo[]> {
  try {
    const res = await fetch('/api/auth/demo-accounts');
    if (!res.ok) return [];
    const data = await res.json();
    return data.accounts || [];
  } catch {
    return [];
  }
}
