# Changelog

## [2025-01-27] - Simplificación del Sistema de Perfiles

### Eliminado ❌
- **Modal de edición de perfil desde el Home**: Se ha eliminado la funcionalidad de editar perfil mediante modal accesible desde el menú de usuario
- **Opción "Editar Perfil" del menú desplegable**: Ya no aparece en el menú de usuario del header
- **Archivo `components/profile-modal.tsx`**: Componente eliminado completamente

### Modificado 🔄
- **Flujo de edición de perfil**: Ahora solo se puede editar el perfil desde la página dedicada `/profile`
- **Menú de usuario**: Simplificado, eliminando la opción de "Editar Perfil"
- **Documentación del Spec**: Actualizada para clarificar que la gestión de perfiles es centralizada
- **Tasks.md**: Agregadas notas sobre la arquitectura de profile management
- **Design.md**: Incluidas notas sobre la eliminación del modal de perfil

### Razón del cambio 📝
Se ha centralizado la edición de perfiles en una sola ubicación para:
- Simplificar la experiencia de usuario
- Reducir la complejidad del código
- Mejorar la consistencia de la interfaz
- Facilitar el mantenimiento futuro

### Impacto en usuarios 👥
- Los usuarios ahora deben ir específicamente a la página de perfil para realizar ediciones
- La experiencia es más consistente y predecible
- Se mantiene toda la funcionalidad de edición, solo cambia la ubicación de acceso

---

## [2025-01-27] - Limpieza de Datos de Muestra

### Eliminado ❌
- **Todos los torneos de muestra**: Madrid TCG League Challenge, Barcelona Prerelease, Valencia VGC Premier, etc.
- **Usuarios de prueba**: Carlos Rodriguez, Maria Garcia, Adrian Lopez, Laura Martinez, David Sanchez, Ana Fernandez
- **Datos relacionados**: Participantes, resultados, matches y archivos de torneos de muestra
- **Referencias en documentación**: Eliminadas menciones específicas a datos de muestra

### Agregado ➕
- **Script de limpieza SQL**: `supabase/cleanup_sample_data.sql`
- **Script automatizado**: `scripts/cleanup-sample-data.js`
- **Comando npm**: `npm run cleanup-data`
- **Guía de limpieza**: `DATA_CLEANUP_GUIDE.md`

### Modificado 🔄
- **seed.sql**: Limpiado de todos los datos de muestra
- **DATABASE_SETUP.md**: Actualizado sin referencias a datos de muestra
- **package.json**: Agregado script de limpieza

### Razón del cambio 📝
- Preparar la aplicación para uso en producción
- Eliminar datos de prueba que ya cumplieron su propósito de demostración
- Proporcionar una base de datos limpia para usuarios reales

### Impacto 🎯
- La aplicación ahora muestra una interfaz limpia sin datos de muestra
- Los usuarios pueden comenzar a crear sus propios torneos desde cero
- La base de datos está optimizada para uso en producción

---

## Versiones Anteriores

### [2025-01-26] - Sistema de Imágenes de Perfil
- ✅ Implementado sistema completo de subida de imágenes
- ✅ Configurado Supabase Storage con políticas de seguridad
- ✅ Límite de 1MB para imágenes de perfil
- ✅ Funcionalidad de copia de datos de perfil
- ✅ Mejoras en la UI del perfil con tooltips y feedback visual