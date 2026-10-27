import { createClient } from '@supabase/supabase-js';
/** Only the publishable/anon key is used in the browser. Never use a service-role key here. */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const configured = /^https:\/\//.test(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY) && !SUPABASE_ANON_KEY.startsWith('YOUR_');
export const db = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;
export const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null => root.querySelector<T>(selector);
export const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] => [...root.querySelectorAll<T>(selector)];
export function esc(value: unknown): string {
  const escapes: Record<string, string> = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  return String(value ?? '').replace(/[&<>"']/g, char => escapes[char]);
}
export function dateStr(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString('th-TH', {dateStyle:'medium',timeStyle:'short'}) : '-';
}
export function assertOk<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data as T;
}
