# Componentes de Autenticación

## Resumen

Este documento describe los componentes de autenticación implementados en el sistema, incluyendo su uso, configuración y características principales.

## Componentes Principales

### LoginForm

Formulario de inicio de sesión con validación en tiempo real y soporte completo de accesibilidad.

**Ubicación**: `components/login-form.tsx`

**Características**:
- Validación en tiempo real de email y contraseña
- Mensajes de error contextuales en español
- Soporte completo de accesibilidad (WCAG 2.1 AA)
- Navegación por teclado
- Estados de carga y error
- Diseño responsivo

**Uso**:
```tsx
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return <LoginForm />;
}
```

### SignUpForm

Formulario avanzado de registro con soporte para jugadores y organizadores.

**Ubicación**: `components/sign-up-form.tsx`

**Características**:
- Registro dual: jugadores y organizadores
- Validación progresiva en tiempo real
- Barra de progreso visual
- Campos dinámicos según el rol seleccionado
- Validación de Player ID específica de Pokémon TCG
- Soporte completo de accesibilidad
- Skip links para navegación rápida
- Diseño responsivo optimizado

**Uso**:
```tsx
import { SignUpForm } from '@/components/sign-up-form';

export default function SignUpPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <SignUpForm />
    </div>
  );
}
```

## Componentes Compartidos

### ValidationSummary

Muestra el progreso de validación del formulario con indicadores visuales.

**Ubicación**: `components/auth/shared/ValidationSummary.tsx`

**Props**:
```tsx
interface ValidationSummaryProps {
  data: ValidationSummaryData;
  className?: string;
}
```

**Uso**:
```tsx
import { ValidationSummary } from '@/components/auth/shared/ValidationSummary';

<ValidationSummary data={validationSummary} />
```

### ErrorMessage

Componente para mostrar mensajes de error con sugerencias de corrección.

**Ubicación**: `components/auth/shared/ErrorMessage.tsx`

**Props**:
```tsx
interface ErrorMessageProps {
  message: string;
  suggestions?: ErrorSuggestion[];
  variant?: 'error' | 'warning';
  className?: string;
}
```

**Uso**:
```tsx
import { ErrorMessage } from '@/components/auth/shared/ErrorMessage';

<ErrorMessage 
  message="Email inválido"
  suggestions={[
    { 
      text: "Usa el formato ejemplo@dominio.com",
      action: () => setEmail("ejemplo@dominio.com"),
      actionText: "Corregir"
    }
  ]}
/>
```

### SuccessAnimation

Animación de éxito para feedback visual positivo.

**Ubicación**: `components/auth/shared/SuccessAnimation.tsx`

**Props**:
```tsx
interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  className?: string;
}
```

### LoadingState

Indicador de estado de carga con spinner y mensaje.

**Ubicación**: `components/auth/shared/LoadingState.tsx`

**Props**:
```tsx
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### SkipLinks

Enlaces de navegación rápida para accesibilidad.

**Ubicación**: `components/auth/shared/SkipLinks.tsx`

**Uso**:
```tsx
import { SkipLinks } from '@/components/auth/shared/SkipLinks';

<SkipLinks />
```

### AccessibilityIndicators

Indicadores visuales para estados de accesibilidad.

**Ubicación**: `components/auth/shared/AccessibilityIndicators.tsx`

## Hooks Personalizados

### useRealTimeValidation

Hook para validación en tiempo real con debouncing y estados de campo.

**Ubicación**: `components/auth/shared/useRealTimeValidation.ts`

**Uso**:
```tsx
import { useRealTimeValidation } from '@/components/auth/shared/useRealTimeValidation';

const {
  data,
  errors,
  fieldStates,
  isValidating,
  validationSummary,
  updateField,
  handleFieldBlur,
  resetValidation
} = useRealTimeValidation({
  initialData,
  validateFn: validateSignUpForm,
  debounceMs: 300,
  validateOnChange: true,
  validateOnBlur: true
});
```

### useScreenReaderAnnouncements

Hook para anuncios de screen reader con control de timing.

**Ubicación**: `components/auth/shared/useScreenReaderAnnouncements.tsx`

**Uso**:
```tsx
import { useScreenReaderAnnouncements } from '@/components/auth/shared/useScreenReaderAnnouncements';

const { announce, clear, AnnouncementRegion } = useScreenReaderAnnouncements({
  politeness: 'polite',
  clearDelay: 3000
});

// En el JSX
<AnnouncementRegion />

// Para anunciar
announce("Formulario enviado exitosamente");
```

### useFormAccessibility

Hook para manejo de accesibilidad en formularios.

**Ubicación**: `components/auth/shared/useFormAccessibility.ts`

**Uso**:
```tsx
import { useFormAccessibility } from '@/components/auth/shared/useFormAccessibility';

const { 
  focusFirstError,
  announceError,
  setupKeyboardNavigation 
} = useFormAccessibility({
  errors,
  isSubmitting
});
```

## Tipos y Constantes

### Tipos Principales

**Ubicación**: `components/auth/shared/types.ts`

```tsx
// Datos de resumen de validación
interface ValidationSummaryData {
  totalFields: number;
  validFields: number;
  invalidFields: number;
  untouchedFields: number;
  completionPercentage: number;
  hasErrors: boolean;
  canSubmit: boolean;
}

// Estado de campo individual
interface FieldState {
  hasBeenTouched: boolean;
  hasBeenBlurred: boolean;
  isValid: boolean;
  isValidating: boolean;
  lastValidatedValue?: any;
}

// Sugerencia de error
interface ErrorSuggestion {
  text: string;
  action?: () => void;
  actionText?: string;
}
```

### Constantes

**Ubicación**: `components/auth/shared/constants.ts`

```tsx
// Delays para anuncios de screen reader
export const SR_ANNOUNCEMENT_DELAY = {
  SHORT: 1000,
  MEDIUM: 3000,
  LONG: 5000
} as const;

// Configuración de validación
export const VALIDATION_CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FIELD_LENGTH: 255
} as const;

// Mensajes de accesibilidad
export const ACCESSIBILITY_MESSAGES = {
  SKIP_TO_MAIN: 'Saltar al contenido principal',
  FORM_PROGRESS: 'Progreso del formulario',
  VALIDATION_SUMMARY: 'Resumen de validación del formulario'
} as const;
```

## Funciones de Validación

### validateLoginForm

Valida datos del formulario de login.

**Ubicación**: `lib/utils/validation.ts`

```tsx
function validateLoginForm(data: LoginFormData): ValidationResult
```

### validateSignUpForm

Valida datos del formulario de registro con soporte para roles.

**Ubicación**: `lib/utils/validation.ts`

```tsx
function validateSignUpForm(data: SignUpFormData): ValidationResult
```

### validatePlayerId

Valida formato de Player ID de Pokémon TCG (1-9999999).

**Ubicación**: `lib/utils/validation.ts`

```tsx
function validatePlayerId(playerId: string): boolean
```

## Localización

Todos los componentes utilizan el sistema de localización centralizado.

**Ubicación**: `lib/i18n/auth.ts`

**Uso**:
```tsx
import { useTypedTranslation } from '@/lib/i18n';

const { tAuth } = useTypedTranslation();

// Acceso a traducciones
tAuth('login.title') // "Iniciar Sesión"
tAuth('signup.playerRole') // "Jugador"
```

## Estilos y Temas

### Clases CSS Principales

```css
/* Estados de validación */
.field-valid { @apply border-green-500 bg-green-50; }
.field-invalid { @apply border-red-500 bg-red-50; }
.field-validating { @apply border-blue-500; }

/* Indicadores de progreso */
.progress-bar { @apply bg-gradient-to-r from-blue-500 to-green-500; }

/* Estados de accesibilidad */
.sr-only { @apply absolute w-px h-px p-0 -m-px overflow-hidden; }
.focus-visible { @apply ring-2 ring-blue-500 ring-offset-2; }
```

### Responsive Design

Los componentes utilizan un sistema de breakpoints consistente:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## Testing

### Tests Unitarios

Ubicación: `__tests__/components/auth/`

- Validación de funciones
- Comportamiento de hooks
- Renderizado de componentes
- Estados de error y éxito

### Tests de Integración

Ubicación: `__tests__/integration/auth-flows.test.tsx`

- Flujos completos de autenticación
- Interacciones entre componentes
- Navegación por teclado
- Validación end-to-end

### Tests de Accesibilidad

Ubicación: `__tests__/accessibility/auth-accessibility.test.tsx`

- Cumplimiento WCAG 2.1 AA
- Navegación por teclado
- Soporte de screen readers
- Contraste de colores

## Mejores Prácticas

### Accesibilidad

1. **Siempre** incluir labels apropiados para inputs
2. **Usar** ARIA attributes para contenido dinámico
3. **Implementar** navegación por teclado completa
4. **Proporcionar** feedback para screen readers
5. **Mantener** contraste mínimo 4.5:1

### Rendimiento

1. **Debounce** validaciones para evitar llamadas excesivas
2. **Lazy load** componentes no críticos
3. **Memoizar** cálculos costosos
4. **Optimizar** bundle size con tree shaking

### UX

1. **Validar** en tiempo real sin ser intrusivo
2. **Mostrar** progreso visual claro
3. **Proporcionar** mensajes de error útiles
4. **Mantener** estados de carga visibles
5. **Permitir** corrección fácil de errores

## Migración y Actualizaciones

### Desde Componentes Anteriores

Si estás migrando desde componentes de auth anteriores:

1. Usa `SignUpForm` (ahora incluye todas las funcionalidades avanzadas)
2. Actualiza imports de hooks compartidos
3. Verifica que las validaciones funcionen correctamente
4. Ejecuta tests de regresión

### Futuras Mejoras

- Integración con OAuth providers
- Verificación de email en tiempo real
- Autocompletado inteligente
- Modo oscuro
- Guardado automático de borradores

## Soporte y Mantenimiento

Para reportar bugs o solicitar mejoras, consulta la documentación de testing y los casos de uso cubiertos en `docs/testing/`.

Los componentes están diseñados para ser:
- **Modulares**: Fáciles de reutilizar
- **Extensibles**: Permiten customización
- **Mantenibles**: Código limpio y documentado
- **Accesibles**: Cumplen estándares web
- **Performantes**: Optimizados para producción