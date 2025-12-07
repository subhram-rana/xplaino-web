# Project Structure and Organization

## Directory Structure

Follow this feature-based structure for all React applications:

```
src/
├── assets/              # Static assets (images, fonts, icons)
│   ├── images/
│   ├── fonts/
│   └── icons/
├── components/          # Shared/reusable components (if not using shared/)
│   └── [ComponentName]/
│       ├── ComponentName.tsx
│       ├── ComponentName.module.css (or .css)
│       ├── ComponentName.test.tsx
│       └── index.ts
├── features/            # Feature-based modules (PRIMARY ORGANIZATION)
│   ├── [feature-name]/
│   │   ├── components/  # Feature-specific components
│   │   │   └── [ComponentName]/
│   │   ├── hooks/       # Feature-specific hooks
│   │   │   └── use[FeatureHook].ts
│   │   ├── services/    # API calls and business logic
│   │   │   └── [feature]Service.ts
│   │   ├── types/       # TypeScript types/interfaces
│   │   │   └── [feature]Types.ts
│   │   ├── utils/       # Feature-specific utilities
│   │   │   └── [feature]Utils.ts
│   │   ├── store/       # Feature-specific state (if using Redux/Zustand)
│   │   │   └── [feature]Slice.ts
│   │   ├── tests/       # Feature-specific tests
│   │   └── index.ts     # Public API exports
├── shared/              # Shared across features
│   ├── components/      # Reusable UI components
│   │   └── [ComponentName]/
│   ├── hooks/           # Shared custom hooks
│   │   └── use[HookName].ts
│   ├── services/        # Shared API services
│   │   └── api/
│   │       ├── client.ts
│   │       └── endpoints.ts
│   ├── utils/           # Shared utility functions
│   │   └── [utility].ts
│   ├── types/           # Shared TypeScript types
│   │   └── common.ts
│   └── constants/       # Shared constants
│       └── index.ts
├── layouts/             # Layout components
│   └── [LayoutName]/
├── pages/               # Page-level components (if using routing)
│   └── [PageName]/
├── store/               # Global state management (Redux/Zustand)
│   ├── slices/          # Redux slices (if using Redux)
│   ├── hooks.ts         # Typed hooks (if using Redux)
│   └── index.ts
├── hooks/               # Global custom hooks (if not in shared/)
├── services/            # Global services (if not in shared/)
├── utils/              # Global utilities (if not in shared/)
├── types/               # Global types (if not in shared/)
├── styles/              # Global styles
│   ├── variables.css
│   ├── reset.css
│   └── globals.css
├── App.tsx              # Root component
├── main.tsx             # Entry point (Vite) or index.tsx (CRA)
└── vite.config.ts       # Vite config (or similar)
```

## Key Principles

### 1. Feature-Based Organization (PRIMARY)

- **Group by feature, not by file type**
- Each feature is self-contained with its own components, hooks, services, types, and tests
- Features should be independent and loosely coupled
- Example features: `auth`, `dashboard`, `profile`, `products`, `orders`

### 2. Co-location Principle

- Keep related files together in the same directory
- Component files should be co-located with:
  - Styles (CSS modules or styled-components)
  - Tests (`.test.tsx` or `.spec.tsx`)
  - Types (if component-specific)
  - Index file for clean imports

### 3. Shared vs Feature-Specific

- **Shared**: Components/hooks/utils used across multiple features
- **Feature-specific**: Components/hooks/utils used only within one feature
- When in doubt, start feature-specific, move to shared when reused

### 4. Barrel Exports (index.ts)

- Use `index.ts` files to create clean public APIs
- Export only what should be used outside the feature/component
- Example:
  ```typescript
  // features/auth/index.ts
  export { LoginForm } from './components/LoginForm';
  export { useAuth } from './hooks/useAuth';
  export type { User } from './types/authTypes';
  ```

## File Organization Rules

1. **One component per file** (except for small related components)
2. **Component directory structure**:
   ```
   ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.module.css
   ├── ComponentName.test.tsx
   ├── ComponentName.types.ts (if complex types)
   └── index.ts
   ```

3. **Test files** should be co-located with the code they test
4. **Type files** should be in `types/` directory within feature or shared
5. **Service files** should be in `services/` directory

## Import Organization

Order imports as follows:
1. React and React-related imports
2. Third-party libraries
3. Shared components/hooks/utils
4. Feature-specific imports
5. Relative imports
6. Types (can be inline or separate)

Example:
```typescript
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth';
import { formatDate } from './utils';
import type { UserProfile } from './types';
```

## Path Aliases

Use path aliases for cleaner imports:
- `@/` → `src/`
- `@/shared/` → `src/shared/`
- `@/features/` → `src/features/`
- `@/components/` → `src/components/` or `src/shared/components/`

Configure in `tsconfig.json` or `vite.config.ts`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
```




