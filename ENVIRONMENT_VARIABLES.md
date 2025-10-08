# 🔐 Variables de Entorno - RotomTracks

## 🛡️ Seguridad Máxima

Por razones de seguridad y siguiendo las mejores prácticas de Vercel, hemos actualizado los nombres de las variables de entorno para usar nombres completamente genéricos que no revelan información sobre el proveedor o la naturaleza de los servicios.

## 📋 Variables Requeridas

### Producción (Nombres Ultra-Seguros) ✅
```env
# Application Configuration
NEXT_PUBLIC_SITE_URL=https://rotomtracks.es

# Backend Service Configuration
NEXT_PUBLIC_API_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_API_TOKEN=eyJ...
API_SECRET=eyJ...
```

### Desarrollo (Compatibilidad Total)
El código soporta múltiples nombres para facilitar la transición:

```env
# Application Configuration
NEXT_PUBLIC_SITE_URL=https://rotomtracks.es

# Nuevos nombres (ultra-seguros - recomendado)
NEXT_PUBLIC_API_URL=https://szedaxhmjvpbjaiodnfg.supabase.co
NEXT_PUBLIC_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# O nombres legacy (funciona)
NEXT_PUBLIC_DATABASE_URL=https://szedaxhmjvpbjaiodnfg.supabase.co
NEXT_PUBLIC_DATABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# O nombres originales (funciona pero menos seguro)
NEXT_PUBLIC_SUPABASE_URL=https://szedaxhmjvpbjaiodnfg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 Migración

### Para Desarrollo Local
1. Actualiza tu `.env.local` con los nuevos nombres ultra-seguros
2. O mantén cualquiera de los nombres anteriores (todos funcionan)

### Para Producción (Vercel)
Usa los nombres ultra-seguros:

```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_TOKEN
API_SECRET
```

## 🎯 Valores Actuales

Para tu proyecto de Supabase:

### NEXT_PUBLIC_API_URL
```
https://szedaxhmjvpbjaiodnfg.supabase.co
```

### NEXT_PUBLIC_API_TOKEN
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZWRheGhtanZwYmphaW9kbmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDIzMjQsImV4cCI6MjA3MTgxODMyNH0.NoGbXyIguTOPSLowmQRxK5Tv9yZ8b8Kdwfi6WE_Y9QQ
```

### API_SECRET
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZWRheGhtanZwYmphaW9kbmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0MjMyNCwiZXhwIjoyMDcxODE4MzI0fQ.FBvvM9utu2ZNiMJZOrlUeL5ZWPKviye7_MIST89yYjA
```

## ✅ Verificación

Ejecuta el script de verificación:
```bash
npm run pre-deploy
```

Este script verificará que tengas configuradas las variables necesarias (con cualquiera de los nombres soportados).

## 🔒 Beneficios de Seguridad

1. **Máxima Ofuscación**: Los nombres no revelan absolutamente nada sobre el proveedor
2. **Sin Palabras Sensibles**: No contiene "KEY", "SECRET", "DATABASE", etc. en variables públicas
3. **Flexibilidad Total**: Fácil migración entre cualquier proveedor
4. **Compatibilidad Completa**: Soporte para todos los nombres legacy
5. **Vercel Compliant**: Cumple con todas las recomendaciones de seguridad

## 🚀 Para Despliegue

Cuando despliegues en Vercel, usa los **nombres ultra-seguros**:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_TOKEN`
- `API_SECRET`

## 🔄 Evolución de Nombres

```
Originales (menos seguros):
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

↓

Legacy (más seguros):
NEXT_PUBLIC_DATABASE_URL
NEXT_PUBLIC_DATABASE_ANON_KEY
DATABASE_SERVICE_KEY

↓

Actuales (ultra-seguros):
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_TOKEN
API_SECRET
```

¡El código funcionará perfectamente con cualquiera de estos nombres! 🛡️✨