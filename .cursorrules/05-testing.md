# Testing Standards

## Testing Philosophy

- Write tests that give confidence in code correctness
- Test user behavior, not implementation details
- Prioritize integration tests over unit tests
- Test critical paths and edge cases
- Keep tests maintainable and readable

## Testing Tools

### Primary Stack
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for integration tests

### Optional Tools
- **Vitest**: Alternative to Jest (if using Vite)
- **Cypress / Playwright**: End-to-end testing
- **Storybook**: Component development and visual testing

## Test File Organization

### Co-location Principle
- Place test files next to the code they test
- Use `.test.tsx` or `.spec.tsx` extension
- Match test file name to source file name

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.module.css
└── index.ts
```

### Test Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Setup (if needed)
  beforeEach(() => {
    // Setup code
  });

  // Cleanup (if needed)
  afterEach(() => {
    // Cleanup code
  });

  describe('rendering', () => {
    it('renders correctly with required props', () => {
      // Test implementation
    });
  });

  describe('user interactions', () => {
    it('handles click events', () => {
      // Test implementation
    });
  });

  describe('edge cases', () => {
    it('handles empty state', () => {
      // Test implementation
    });
  });
});
```

## Component Testing

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Form', () => {
  it('submits form with user input', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    
    render(<Form onSubmit={handleSubmit} />);
    
    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });
});
```

### Testing Async Operations

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('UserProfile', () => {
  it('displays user data after loading', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <UserProfile userId="1" />
      </QueryClientProvider>
    );

    // Check loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    // Verify data is displayed
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });
});
```

## Custom Hooks Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## API Mocking with MSW

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.id,
        name: 'John Doe',
        email: 'john@example.com',
      })
    );
  }),
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/setupTests.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

```typescript
// ✅ Good: Test what user sees/does
it('displays error message when form is invalid', () => {
  render(<Form />);
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();
});

// ❌ Bad: Test implementation details
it('sets error state to true', () => {
  const { result } = renderHook(() => useForm());
  act(() => {
    result.current.setError(true);
  });
  expect(result.current.error).toBe(true);
});
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact:

```typescript
// Priority order:
// 1. getByRole (most accessible)
screen.getByRole('button', { name: /submit/i });

// 2. getByLabelText
screen.getByLabelText(/email/i);

// 3. getByPlaceholderText
screen.getByPlaceholderText(/enter email/i);

// 4. getByText
screen.getByText(/welcome/i);

// 5. getByTestId (last resort)
screen.getByTestId('submit-button');
```

### 3. Test Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 4. Test Error States

```typescript
it('displays error message on API failure', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

### 5. Test Loading States

```typescript
it('shows loading spinner while fetching data', () => {
  render(<UserList />);
  expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
});
```

## Test Coverage

### Coverage Goals
- Aim for 80%+ coverage on critical paths
- Focus on business logic, not just line coverage
- Test edge cases and error scenarios
- Don't sacrifice test quality for coverage percentage

### Coverage Configuration

```json
// jest.config.js or vitest.config.ts
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## E2E Testing (Optional)

### Cypress Example

```typescript
// cypress/e2e/user-flow.cy.ts
describe('User Authentication Flow', () => {
  it('allows user to login', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
});
```

## Testing Checklist

Before writing tests, ensure:

- [ ] Test file is co-located with source file
- [ ] Tests use React Testing Library queries
- [ ] Tests focus on user behavior
- [ ] Async operations are properly handled
- [ ] Error states are tested
- [ ] Loading states are tested
- [ ] Edge cases are covered
- [ ] Tests are readable and maintainable
- [ ] Mocks are set up correctly (if needed)
- [ ] Tests are independent and can run in any order




