import { request } from './client';
import type { AuthResponse } from '../types';

export function register(email: string, password: string): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/register', { method: 'POST', body: { email, password } });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}
