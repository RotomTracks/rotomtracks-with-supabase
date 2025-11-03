# RotomTracks Desktop (Tauri + React)

## 1) Requisitos
- pnpm (v10+)
- Node.js 20+
- Rust + Cargo (Tauri)
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: Visual Studio Build Tools (C++), Windows 10/11 SDK

## 2) Variables de entorno
Crea un archivo `.env` en esta carpeta `desktop/` con:

VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_WEB_BASE_URL=https://tu-dominio.com

> VITE_WEB_BASE_URL apunta a la web que expone `/api/tournaments/[id]/process`.

## 3) Desarrollo
Desde la raíz del repo:

pnpm desktop:dev

Abre la ventana, inicia sesión (cuenta con rol organizador), elige torneo y archivo `.tdf`.

## 4) Build (instaladores)
Desde la raíz del repo:

pnpm desktop:build

Artefactos generados:
- macOS: `desktop/src-tauri/target/release/bundle/` → `.app` y `.dmg`
- Windows: ejecutar el mismo comando en Windows → `.msi`/`.exe`

## 5) Funcionalidad actual
- Login Supabase (solo organizadores)
- Listado de torneos futuros del organizador y selección
- Selector de archivo `.tdf`
- Watcher que sube el `.tdf` y dispara el procesado en el servidor
- Bandeja del sistema (pausar/reanudar, mostrar, salir)
- Reintentos con backoff + notificaciones nativas

## 6) CI (opcional)
Se incluye un workflow en `.github/workflows/desktop-build.yml` para construir en macOS y Windows. Configura estos Secrets en GitHub:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WEB_BASE_URL`

Lanza manualmente el workflow o crea un tag `desktop-vX.Y.Z`.

