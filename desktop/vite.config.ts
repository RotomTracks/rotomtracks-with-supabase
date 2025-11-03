import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

// Load env from desktop/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Also try to load env from project root (front) if present
const repoRoot = path.resolve(__dirname, '..');
const rootEnv = path.resolve(repoRoot, '.env');
const rootEnvLocal = path.resolve(repoRoot, '.env.local');
if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
if (fs.existsSync(rootEnvLocal)) dotenv.config({ path: rootEnvLocal });

// Map Next.js environment variables to Vite (supports all naming conventions)
const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL 
  || process.env.NEXT_PUBLIC_API_URL 
  || process.env.NEXT_PUBLIC_DATABASE_URL 
  || process.env.NEXT_PUBLIC_SUPABASE_URL 
  || '';

const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY 
  || process.env.NEXT_PUBLIC_API_TOKEN 
  || process.env.NEXT_PUBLIC_CLIENT_AUTH 
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY 
  || '';

const VITE_WEB_BASE_URL = process.env.VITE_WEB_BASE_URL 
  || process.env.NEXT_PUBLIC_SITE_URL 
  || process.env.NEXT_PUBLIC_APP_URL 
  || '';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'TAURI_'],
  // Use relative paths for Tauri
  base: './',
  server: {
    port: 5173,
    strictPort: true,
    hmr: { clientPort: 5173 },
  },
  build: {
    outDir: 'dist', // sincronizado con tauri.conf.json
    emptyOutDir: true
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(VITE_SUPABASE_ANON_KEY),                                                                            
    'import.meta.env.VITE_WEB_BASE_URL': JSON.stringify(VITE_WEB_BASE_URL),
  },
});



