import { neon } from '@neondatabase/serverless';
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  return neon(url);
}
