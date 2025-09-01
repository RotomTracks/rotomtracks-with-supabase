# 🚀 Guía de Despliegue - RotomTracks

Esta guía te ayudará a desplegar RotomTracks en producción usando Vercel y Supabase.

## 📋 Checklist Pre-Despliegue

- [ ] Proyecto de Supabase creado y configurado
- [ ] Variables de entorno configuradas
- [ ] Build local exitoso (`npm run build`)
- [ ] Repositorio en GitHub/GitLab
- [ ] Cuenta de Vercel

## 🔧 Configuración de Supabase

### 1. Crear Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva organización (si es necesario)
3. Crea un nuevo proyecto:
   - **Nombre**: RotomTracks
   - **Región**: Elige la más cercana a tus usuarios
   - **Plan**: Free tier es suficiente para empezar

### 2. Configurar Autenticación

En Authentication > Settings:
- **Site URL**: `https://tu-dominio.vercel.app`
- **Redirect URLs**: 
  - `https://tu-dominio.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (para desarrollo)

### 3. Configurar Storage

1. Ve a Storage
2. Crea un nuevo bucket:
   - **Nombre**: `user-uploads`
   - **Público**: No (se manejará con políticas)

3. Configura políticas RLS:
```sql
-- Política para subir avatares
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para ver avatares públicos
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'user-uploads');
```

### 4. Configurar Base de Datos

Las tablas se crearán automáticamente, pero puedes ejecutar este SQL para crearlas manualmente:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  city TEXT,
  country TEXT,
  pokemon_trainer_id TEXT,
  pokemon_go_code TEXT,
  user_role TEXT DEFAULT 'player' CHECK (user_role IN ('player', 'organizer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  tournament_reminders BOOLEAN DEFAULT true,
  match_notifications BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_tournament_history BOOLEAN DEFAULT true,
  show_statistics BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'es',
  timezone TEXT DEFAULT 'Europe/Madrid',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  preferred_formats TEXT[] DEFAULT '{}',
  auto_register_similar BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de torneos
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tournament_type TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  current_players INTEGER DEFAULT 0,
  max_players INTEGER,
  registration_open BOOLEAN DEFAULT true,
  organizer_id UUID REFERENCES auth.users(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas similares para preferencias
CREATE POLICY "Users can manage their own preferences" ON user_preferences
FOR ALL USING (auth.uid() = user_id);

-- Políticas para torneos
CREATE POLICY "Anyone can view tournaments" ON tournaments
FOR SELECT USING (true);

CREATE POLICY "Organizers can manage their tournaments" ON tournaments
FOR ALL USING (auth.uid() = organizer_id);
```

## 🌐 Despliegue en Vercel

### Método 1: Desde GitHub

1. **Conecta tu repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub

2. **Configura el proyecto**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raíz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Configura variables de entorno** (nombres seguros recomendados):
   ```
   NEXT_PUBLIC_API_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_API_TOKEN=tu_clave_anon
   API_SECRET=tu_clave_service_role
   ```

4. **Despliega**: Haz clic en "Deploy"

### Método 2: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la raíz del proyecto
vercel

# Seguir las instrucciones interactivas
# Configurar variables de entorno cuando se solicite
```

## 🔐 Variables de Entorno

### Requeridas (Nombres Seguros)
```env
NEXT_PUBLIC_API_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_API_TOKEN=eyJ...
API_SECRET=eyJ...
```

### Legacy (Aún Soportado)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Opcionales
```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

## 🧪 Verificación Post-Despliegue

### Checklist de Funcionalidades

- [ ] **Página principal carga correctamente**
- [ ] **Registro de usuarios funciona**
- [ ] **Login/logout funciona**
- [ ] **Detección de ubicación funciona**
- [ ] **Búsqueda de torneos funciona**
- [ ] **Dashboard de usuario accesible**
- [ ] **Creación de torneos (para organizadores)**
- [ ] **Subida de archivos TDF funciona**

### Tests Básicos

```bash
# Test de build local
npm run build
npm run start

# Verificar en http://localhost:3000
```

## 🐛 Troubleshooting

### Errores Comunes

1. **Error de conexión a Supabase**:
   - Verifica que las URLs y claves sean correctas
   - Asegúrate de que no haya espacios extra en las variables

2. **Error de autenticación**:
   - Verifica la configuración de Site URL en Supabase
   - Revisa las Redirect URLs

3. **Error de permisos RLS**:
   - Verifica que las políticas RLS estén configuradas
   - Revisa los logs de Supabase

4. **Error de build en Vercel**:
   - Verifica que todas las dependencias estén en `package.json`
   - Revisa los logs de build en Vercel

### Logs y Debugging

- **Vercel**: Ve a tu proyecto > Functions > View Function Logs
- **Supabase**: Dashboard > Logs > API Logs
- **Browser**: Consola de desarrollador (F12)

## 📈 Optimizaciones Post-Despliegue

### Performance
- Configura CDN para assets estáticos
- Habilita compresión gzip
- Optimiza imágenes con Next.js Image

### SEO
- Configura meta tags apropiados
- Añade sitemap.xml
- Configura robots.txt

### Monitoreo
- Configura Vercel Analytics
- Añade error tracking (Sentry)
- Monitorea performance con Web Vitals

## 🔄 CI/CD

Para automatizar despliegues:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

¡Tu aplicación RotomTracks debería estar ahora funcionando en producción! 🎉