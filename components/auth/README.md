# Authentication Components

This directory contains all authentication-related components for the application.

## Structure

```
auth/
├── shared/           # Reusable auth components and utilities
│   ├── components/   # UI components
│   ├── hooks/        # Custom hooks
│   ├── types.ts      # TypeScript type definitions
│   ├── constants.ts  # Configuration constants
│   └── index.ts      # Main exports
└── README.md         # This file
```

## Components

### Form Components
- **FormCard**: Container for authentication forms with consistent styling
- **FormField**: Enhanced input field with validation states and accessibility
- **LoadingButton**: Button with loading states and proper accessibility
- **ValidationSummary**: Progress indicator showing form completion status

### Feedback Components
- **ErrorMessage**: Enhanced error display with contextual suggestions
- **SuccessMessage**: Success notifications with proper styling
- **SuccessAnimation**: Animated success feedback for completed actions
- **LoadingState**: Loading indicators with different sizes and states

### Accessibility Components
- **SkipLinks**: Navigation shortcuts for keyboard users
- **AccessibilityIndicators**: Optional accessibility controls (high contrast, large text, etc.)

## Hooks

### useRealTimeValidation
Progressive validation system with real-time feedback:
- Debounced validation to avoid excessive API calls
- Visual states: validating, success, error
- Form completion tracking
- Configurable validation timing

### useFormAccessibility
Enhanced form accessibility features:
- Automatic error focus management
- Keyboard navigation improvements
- Screen reader announcements
- Focus restoration utilities

### useScreenReaderAnnouncements
Screen reader announcement management:
- Polite and assertive announcement modes
- Automatic cleanup after delays
- React component for announcement regions

## Features

### Progressive Validation
- Real-time validation with visual feedback
- Smart debouncing based on user interaction
- Success states for completed fields
- Form completion progress tracking

### Enhanced Error Handling
- Contextual error messages with recovery suggestions
- Automatic retry mechanisms
- Network error detection and handling
- User-friendly error explanations

### Responsive Design
- Mobile-first approach with touch-friendly interactions
- Adaptive layouts for different screen sizes
- Proper spacing and typography scaling
- Optimized for both desktop and mobile

### Accessibility
- WCAG 2.1 AA compliance
- Comprehensive keyboard navigation
- Screen reader support with proper ARIA labels
- Skip links and landmark navigation
- High contrast and reduced motion support

## Usage Examples

### Basic Form with Validation
```tsx
import { FormCard, FormField, LoadingButton, useRealTimeValidation } from '@/components/auth/shared';

function MyForm() {
  const {
    getFieldError,
    getFieldSuccess,
    isFieldValidating,
    handleFieldChange,
    handleFieldBlur,
    validationSummary
  } = useRealTimeValidation({
    validateFn: myValidationFunction,
    debounceMs: 300,
    showSuccessStates: true,
    enableProgressiveValidation: true,
  });

  return (
    <FormCard title="My Form" description="Form description">
      <FormField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleFieldChange('email', value, formData)}
        onBlur={() => handleFieldBlur('email')}
        error={getFieldError('email')}
        success={getFieldSuccess('email')}
        isValidating={isFieldValidating('email')}
        required
      />
      
      <LoadingButton
        type="submit"
        loading={isLoading}
        disabled={!validationSummary.canSubmit}
      >
        Submit
      </LoadingButton>
    </FormCard>
  );
}
```

### Error Handling with Suggestions
```tsx
import { ErrorMessage } from '@/components/auth/shared';

function MyComponent() {
  return (
    <ErrorMessage
      title="Login Failed"
      message="Invalid credentials"
      onRetry={handleRetry}
      suggestions={[
        {
          text: "Check your email and password",
        },
        {
          text: "Forgot your password?",
          action: () => router.push('/auth/forgot-password'),
          actionText: "Reset password"
        }
      ]}
    />
  );
}
```

## Configuration

### Validation Timing
```typescript
import { VALIDATION_DEBOUNCE_MS } from '@/components/auth/shared/constants';

// Use predefined timing constants
const validationConfig = {
  debounceMs: VALIDATION_DEBOUNCE_MS.LOGIN, // 500ms for login
  // or VALIDATION_DEBOUNCE_MS.SIGNUP (300ms)
  // or VALIDATION_DEBOUNCE_MS.PASSWORD (400ms)
};
```

### Animation Durations
```typescript
import { ANIMATION_DURATION } from '@/components/auth/shared/constants';

// Use predefined animation durations
const animationConfig = {
  duration: ANIMATION_DURATION.SUCCESS, // 3000ms
  // or ANIMATION_DURATION.FAST (200ms)
  // or ANIMATION_DURATION.NORMAL (300ms)
};
```

## Best Practices

1. **Always use the shared components** instead of creating custom form elements
2. **Enable progressive validation** for better user experience
3. **Provide contextual error messages** with recovery suggestions
4. **Test with keyboard navigation** and screen readers
5. **Use appropriate debounce timing** based on the form complexity
6. **Include success animations** for important actions
7. **Ensure proper focus management** for accessibility

## Migration from Old Components

If you're migrating from older authentication components:

1. Replace custom form fields with `FormField`
2. Use `useRealTimeValidation` instead of manual validation
3. Replace basic error messages with `ErrorMessage` component
4. Add `ValidationSummary` for form progress tracking
5. Include `SkipLinks` for accessibility
6. Use `SuccessAnimation` for important actions

## Testing

The components include comprehensive accessibility features that should be tested:

1. **Keyboard navigation**: Tab through all interactive elements
2. **Screen reader compatibility**: Test with NVDA, JAWS, or VoiceOver
3. **High contrast mode**: Ensure visibility in high contrast themes
4. **Mobile responsiveness**: Test on various screen sizes
5. **Error scenarios**: Test all error states and recovery flows