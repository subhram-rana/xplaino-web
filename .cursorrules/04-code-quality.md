# Code Quality and Best Practices

## TypeScript Best Practices

### Type Safety

- Always use TypeScript for type safety
- Avoid `any` type - use `unknown` if type is truly unknown
- Use proper type inference where possible
- Define interfaces for all props and data structures

```typescript
// ✅ Good: Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // Implementation
};

// ❌ Bad: Using any
const getUser = async (id: any): Promise<any> => {
  // Implementation
};
```

### Type Definitions

- Place types in `types/` directory within feature or shared
- Use descriptive type names
- Export types from index files
- Use `type` for unions/intersections, `interface` for objects

```typescript
// types/userTypes.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export type UserWithRole = User & {
  role: UserRole;
};
```

## Code Organization

### Import Organization

Order imports consistently:

```typescript
// 1. React and React-related
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import axios from 'axios';
import { format } from 'date-fns';

// 3. Shared/Common imports
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';

// 4. Feature imports
import { useProducts } from '@/features/products';

// 5. Relative imports
import { formatPrice } from './utils';
import styles from './Component.module.css';

// 6. Types (can be inline or separate)
import type { User } from './types';
```

### Function Organization

Order functions within components:

```typescript
export const Component: React.FC<Props> = (props) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState();
  const { data } = useCustomHook();

  // 2. Derived state / computed values
  const computed = useMemo(() => compute(data), [data]);

  // 3. Event handlers
  const handleClick = () => {};

  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 5. Early returns
  if (loading) return <Spinner />;

  // 6. Render
  return <div>...</div>;
};
```

## Error Handling

### Error Boundaries

Implement error boundaries for component tree error handling:

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling

Handle errors in async operations:

```typescript
// ✅ Good: Proper error handling
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await api.getData();
    setData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};

// With React Query
const { data, error, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  onError: (error) => {
    // Handle error
    toast.error(error.message);
  },
});
```

## Code Style

### Naming Conventions

- **Components**: PascalCase (`UserProfile`)
- **Hooks**: camelCase starting with "use" (`useAuth`, `useUserData`)
- **Functions**: camelCase (`fetchUser`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`User`, `UserProfileProps`)

### Component Props

- Use descriptive prop names
- Document complex props with JSDoc
- Provide default values where appropriate
- Use destructuring for cleaner code

```typescript
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'primary' | 'secondary';
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Disabled state */
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
}) => {
  // Implementation
};
```

### Comments and Documentation

- Use JSDoc for public APIs
- Comment "why", not "what"
- Keep comments up to date
- Remove commented-out code

```typescript
/**
 * Fetches user data from the API
 * 
 * @param userId - Unique identifier for the user
 * @returns Promise resolving to user data
 * @throws {Error} If user is not found
 */
const fetchUser = async (userId: string): Promise<User> => {
  // Implementation
};
```

## Performance Best Practices

### Memoization

Use memoization appropriately:

```typescript
// Memoize expensive components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  // Component logic
});

// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks passed to child components
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Code Splitting

Implement code splitting for better performance:

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Usage with Suspense
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

### Avoid Unnecessary Re-renders

- Use `React.memo` for pure components
- Memoize context values
- Split contexts to reduce re-render scope
- Use proper dependency arrays in hooks

## Accessibility (a11y)

### Semantic HTML

- Use semantic HTML elements
- Proper heading hierarchy (h1 → h2 → h3)
- Use ARIA labels when needed
- Ensure keyboard navigation works

```typescript
// ✅ Good: Semantic HTML
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

// ❌ Bad: Div soup
<div>
  <div onClick={handleClick}>Home</div>
</div>
```

### ARIA Attributes

Use ARIA attributes appropriately:

```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  ×
</button>
```

## Security Best Practices

### Input Validation

- Validate all user inputs
- Sanitize data before rendering
- Use TypeScript for type safety
- Validate API responses

### XSS Prevention

- Use React's built-in XSS protection
- Avoid `dangerouslySetInnerHTML` unless necessary
- Sanitize any HTML content

### API Security

- Never expose API keys in client code
- Use environment variables for sensitive data
- Implement proper authentication/authorization
- Validate and sanitize API responses

## Code Review Checklist

Before submitting code, ensure:

- [ ] TypeScript types are properly defined
- [ ] Components follow single responsibility principle
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Code is properly commented/documentation
- [ ] Tests are written (if applicable)
- [ ] No console.logs or debug code
- [ ] Performance considerations are addressed
- [ ] Accessibility is considered
- [ ] Code follows project conventions

