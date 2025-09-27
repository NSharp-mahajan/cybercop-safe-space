# Auto Import Guide

This project is configured to make importing common hooks and components easier.

## Quick Import Methods

### Method 1: Central Import File (Recommended)

All commonly used hooks and components are exported from `@/lib/hooks`. You can import them all at once:

```typescript
import { useAuth, useSubscription, useToast, usePremiumFeature } from '@/lib/hooks';
```

### Method 2: VSCode Snippets

Type these shortcuts in any `.tsx` or `.ts` file:

- `iah` → Import all hooks
- `ias` → Import auth and subscription hooks  
- `ipf` → Import premium feature hook
- `iui` → Import common UI components
- `rcwh` → Create React component with hooks

### Method 3: VSCode Auto-Import

Just start typing the hook name and VSCode will suggest the import:

1. Type `useAuth`
2. Press `Ctrl+Space` (or `Cmd+Space` on Mac)
3. Select the suggestion and it will auto-import

## What's Available

### Hooks
- `useAuth` - Authentication context
- `useSubscription` - Subscription management
- `useToast` - Toast notifications
- `usePremiumFeature` - Premium feature access

### UI Components
- `Button`, `Input` - Form elements
- `Card`, `CardContent`, `CardHeader`, etc. - Card components
- `Alert`, `AlertDescription` - Alert components
- `Badge` - Badge component

### Utilities
- `cn` - Class name utility
- `toast` - Toast function

## Example Usage

```typescript
// Single import for everything you need
import { useAuth, useSubscription, Button, Card, toast } from '@/lib/hooks';

const MyComponent = () => {
  const { user } = useAuth();
  const { currentSubscription } = useSubscription();
  
  const handleClick = () => {
    toast({
      title: "Hello!",
      description: "This is easier now!"
    });
  };

  return (
    <Card>
      <Button onClick={handleClick}>Click me</Button>
    </Card>
  );
};
```

## Tips

1. **VSCode IntelliSense**: Start typing the hook name and VSCode will suggest the import
2. **Quick Fix**: If you use a hook without importing, click on it and press `Ctrl+.` to quick fix
3. **Organize Imports**: Press `Shift+Alt+O` to organize imports in your file

## Troubleshooting

If auto-import isn't working:
1. Restart VSCode
2. Make sure TypeScript service is running (check bottom right of VSCode)
3. Run `npm install` to ensure all dependencies are installed
