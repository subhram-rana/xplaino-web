# Component Patterns and Organization

## Component Design Principles

### 1. Single Responsibility Principle

Each component should have one clear purpose:
- ✅ Good: `UserProfile` displays user information
- ❌ Bad: `UserProfile` displays user info, handles authentication, and manages orders

### 2. Component Categories

Organize components into three categories:

#### Atomic Components (Shared)
- Small, reusable UI elements
- No business logic
- Highly configurable via props
- Examples: `Button`, `Input`, `Card`, `Modal`, `Spinner`
- Location: `src/shared/components/`

#### Composite Components (Shared/Feature)
- Combinations of atomic components
- May contain some logic
- Examples: `FormField`, `DataTable`, `SearchBar`
- Location: `src/shared/components/` or `src/features/[feature]/components/`

#### Feature Components (Feature-Specific)
- Complex components tied to specific features
- Contains business logic
- Examples: `LoginForm`, `ProductCard`, `OrderSummary`
- Location: `src/features/[feature]/components/`

### 3. Presentational vs Container Components

#### Presentational Components
- Focus on UI rendering
- Receive data via props
- Trigger callbacks via props
- No direct API calls or state management
- Easy to test and reuse

```typescript
// Presentational Component
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={() => onEdit(user.id)}>Edit</Button>
    </Card>
  );
};
```

#### Container Components
- Handle data fetching and state management
- Use custom hooks for business logic
- Pass data to presentational components
- Connect to global state if needed

```typescript
// Container Component
export const UserProfileContainer: React.FC = () => {
  const { user, isLoading, error } = useUser();
  const { updateUser } = useUserActions();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <UserCard user={user} onEdit={updateUser} />;
};
```

## Component Structure Template

```typescript
import React from 'react';
import type { ComponentNameProps } from './ComponentName.types';
import styles from './ComponentName.module.css';

/**
 * ComponentName - Brief description of what this component does
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructure props with defaults
  prop1,
  prop2 = 'default',
  ...rest
}) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState();
  
  // 2. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 3. Computed values
  const computedValue = useMemo(() => {
    // Computation
  }, [dependencies]);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Early returns (loading, error states)
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 6. Render
  return (
    <div className={styles.container} {...rest}>
      {/* Component JSX */}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

## Component Best Practices

### 1. Props Interface

- Always define TypeScript interfaces for props
- Use descriptive prop names
- Document complex props with JSDoc
- Prefer composition over configuration

```typescript
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

### 2. Default Props

- Use default parameters instead of `defaultProps` (modern React)
- Provide sensible defaults

```typescript
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  ...rest
}) => {
  // Component implementation
};
```

### 3. Component Composition

- Prefer composition over prop drilling
- Use children prop for flexible layouts
- Create compound components for complex UI

```typescript
// Good: Composition
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// Bad: Prop drilling
<Card header="Title" body="Content" footer="Actions" />
```

### 4. Conditional Rendering

- Use early returns for loading/error states
- Keep JSX clean and readable
- Extract complex conditions to variables

```typescript
// Good
if (!user) return null;
if (isLoading) return <Spinner />;

// Good: Extract complex conditions
const canEdit = user && user.role === 'admin' && !isReadOnly;
```

### 5. Event Handlers

- Use descriptive handler names (handle*, on*)
- Keep handlers focused and small
- Extract complex logic to custom hooks

```typescript
// Good
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await onSubmit(formData);
};

// Bad: Inline complex logic
<button onClick={async (e) => {
  e.preventDefault();
  const data = await fetch('/api');
  const json = await data.json();
  setState(json);
}}>
```

### 6. Memoization

- Use `React.memo` for expensive components
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references
- Don't over-optimize prematurely

```typescript
// Memoize expensive components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  const processed = useMemo(() => expensiveOperation(data), [data]);
  return <div>{processed}</div>;
});

// Stable callback reference
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## Custom Hooks Pattern

Extract component logic into custom hooks:

```typescript
// hooks/useFeature.ts
export const useFeature = (id: string) => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchFeature(id)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};

// Component uses the hook
export const FeatureComponent: React.FC<Props> = ({ id }) => {
  const { data, loading, error } = useFeature(id);
  // Component logic
};
```

## Error Boundaries

Implement error boundaries for graceful error handling:

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Component File Organization

```
ComponentName/
├── ComponentName.tsx           # Main component
├── ComponentName.module.css    # Styles (CSS modules)
├── ComponentName.test.tsx      # Tests
├── ComponentName.types.ts       # TypeScript types (if complex)
├── ComponentName.stories.tsx    # Storybook stories (if using)
└── index.ts                    # Barrel export
```



