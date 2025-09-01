<div align="center">
  <h1>🏆 RotomTracks</h1>
  <p><strong>La plataforma definitiva para torneos de Pokémon</strong></p>
  <p>Gestiona, descubre y participa en torneos de TCG, VGC y Pokémon GO</p>
</div>

<p align="center">
  <a href="#características"><strong>Características</strong></a> ·
  <a href="#despliegue-en-vercel"><strong>Desplegar en Vercel</strong></a> ·
  <a href="#desarrollo-local"><strong>Desarrollo Local</strong></a> ·
  <a href="#configuración-de-supabase"><strong>Configuración</strong></a>
</p>
<br/>

## Características

### 🎮 **Para Jugadores**
- **Descubrimiento inteligente**: Encuentra torneos cerca de ti con detección automática de ubicación
- **Búsqueda avanzada**: Filtra por formato (TCG, VGC, Pokémon GO), fecha, ubicación y más
- **Perfil personalizado**: Gestiona tu información, IDs de entrenador y preferencias
- **Historial completo**: Accede a tus participaciones y resultados pasados

### 🏆 **Para Organizadores**
- **Gestión completa**: Crea y administra torneos con herramientas profesionales
- **Procesamiento TDF**: Importa archivos de Tournament Director automáticamente
- **Reportes HTML**: Genera reportes profesionales con resultados detallados
- **Dashboard avanzado**: Monitorea participantes, emparejamientos y estadísticas

### 🛠 **Tecnología**
- **Next.js 15** con App Router y Server Components
- **Supabase** para autenticación y base de datos
- **TypeScript** para desarrollo type-safe
- **Tailwind CSS** + **shadcn/ui** para diseño moderno
- **Geolocalización** para descubrimiento de torneos locales
- **Responsive design** optimizado para móvil y desktop

## Despliegue en Vercel

### Opción 1: Despliegue Directo
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/rotomtracks)

### Opción 2: Despliegue Manual

1. **Fork o clona este repositorio**
2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configura las variables de entorno** en Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=tu_clave_anon
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
   ```

4. **Despliega**: Vercel construirá y desplegará automáticamente

## Desarrollo Local

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm
- Cuenta de Supabase

### Configuración

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/rotomtracks.git
   cd rotomtracks
   ```

2. **Instala dependencias**:
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configura variables de entorno**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=tu_clave_anon
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
   ```

4. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abre tu navegador** en [http://localhost:3000](http://localhost:3000)

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo con Turbopack
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting con ESLint

## Configuración de Supabase

### 1. Crear Proyecto
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración

### 2. Configurar Base de Datos
La aplicación creará automáticamente las tablas necesarias en el primer uso, incluyendo:
- `user_profiles` - Perfiles de usuario
- `tournaments` - Información de torneos
- `tournament_participants` - Participantes
- `tournament_matches` - Emparejamientos
- `tournament_results` - Resultados

### 3. Configurar Storage (Opcional)
Para subida de archivos TDF y avatares:
1. Ve a Storage en tu dashboard de Supabase
2. Crea un bucket llamado `user-uploads`
3. Configura las políticas de acceso según tus necesidades

### 4. Obtener Credenciales
En Settings > API de tu proyecto Supabase:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

¿Necesitas ayuda? 
- 📧 Email: soporte@rotomtracks.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/rotomtracks/issues)
- 💬 Discord: [Servidor de la Comunidad](https://discord.gg/rotomtracks)
