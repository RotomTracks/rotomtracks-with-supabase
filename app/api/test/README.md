# API Tests

Esta carpeta contiene todos los endpoints de prueba y testing para la API.

## Estructura

- Todos los archivos de test de la API deben crearse en esta carpeta
- Usar el patrón `route.ts` para cada endpoint de test
- Documentar el propósito de cada test en comentarios

## Ejemplos de Uso

```typescript
// app/api/test/example/route.ts
export async function GET() {
  return Response.json({ message: 'Test endpoint working' });
}
```

## Convenciones

- Nombre de carpetas en kebab-case
- Un archivo `route.ts` por endpoint
- Incluir documentación en comentarios
- Usar prefijos descriptivos para evitar conflictos
