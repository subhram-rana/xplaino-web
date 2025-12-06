# Naming Conventions

## General Principles

1. **Be Descriptive**: Names should clearly indicate purpose
2. **Be Consistent**: Use same patterns throughout the codebase
3. **Follow Conventions**: Stick to established React/TypeScript conventions
4. **Avoid Abbreviations**: Use full words unless abbreviation is widely understood

## File and Folder Naming

### Files

- **Components**: PascalCase (`UserProfile.tsx`, `LoginForm.tsx`)
- **Hooks**: camelCase starting with "use" (`useAuth.ts`, `useUserData.ts`)
- **Utilities**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **Types**: PascalCase (`userTypes.ts`, `apiTypes.ts`)
- **Constants**: camelCase or UPPER_SNAKE_CASE (`constants.ts` or `API_CONSTANTS.ts`)
- **Tests**: Same as source file with `.test` or `.spec` (`UserProfile.test.tsx`)
- **Styles**: Same as component with `.module.css` (`UserProfile.module.css`)

### Folders

- **Feature folders**: kebab-case (`user-profile/`, `product-list/`)
- **Component folders**: PascalCase (`UserProfile/`, `LoginForm/`)
- **Shared folders**: kebab-case or camelCase (`shared/`, `utils/`)

### Examples

```
src/
├── features/
│   ├── user-profile/          # kebab-case
│   │   ├── UserProfile.tsx     # PascalCase
│   │   ├── useUserProfile.ts   # camelCase with "use"
│   │   └── userProfileUtils.ts # camelCase
│   └── product-list/
│       ├── ProductList.tsx
│       └── ProductList.test.tsx
├── shared/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.module.css
│   │       └── Button.test.tsx
│   └── hooks/
│       └── useAuth.ts
└── utils/
    └── formatDate.ts
```

## Component Naming

### Component Names

- **PascalCase**: All component names (`UserProfile`, `LoginForm`)
- **Descriptive**: Clearly indicate component purpose
- **Noun-based**: Components are things (`Button`, `Card`, `UserList`)

```typescript
// ✅ Good
export const UserProfile: React.FC = () => {};
export const ProductCard: React.FC = () => {};
export const NavigationMenu: React.FC = () => {};

// ❌ Bad
export const Profile: React.FC = () => {}; // Too generic
export const Comp: React.FC = () => {}; // Abbreviation
export const userProfile: React.FC = () => {}; // Wrong case
```

### Component File Names

- Match component name exactly
- Use `.tsx` extension for components with JSX

```typescript
// File: UserProfile.tsx
export const UserProfile: React.FC = () => {};

// File: Button.tsx
export const Button: React.FC = () => {};
```

## Variable Naming

### Variables and Constants

- **camelCase**: Regular variables (`userName`, `isLoading`, `productList`)
- **UPPER_SNAKE_CASE**: Constants (`API_BASE_URL`, `MAX_RETRIES`)
- **Boolean**: Prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasError`, `shouldRender`)

```typescript
// ✅ Good
const userName = 'John';
const isLoading = true;
const hasPermission = false;
const productList = [];
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const UserName = 'John'; // Wrong case
const loading = true; // Not descriptive
const data = []; // Too generic
```

### Function Names

- **camelCase**: Function names (`fetchUser`, `handleSubmit`, `formatDate`)
- **Verb-based**: Functions do things (`get`, `set`, `handle`, `format`, `validate`)
- **Event handlers**: Prefix with `handle` (`handleClick`, `handleSubmit`)

```typescript
// ✅ Good
const fetchUser = async (id: string) => {};
const handleSubmit = (e: Event) => {};
const formatDate = (date: Date) => {};
const validateEmail = (email: string) => {};

// ❌ Bad
const getUser = async (id: string) => {}; // Less descriptive
const submit = (e: Event) => {}; // Not clear it's a handler
const date = (date: Date) => {}; // Not a verb
```

## Hook Naming

### Custom Hooks

- **camelCase** starting with "use" (`useAuth`, `useUserData`, `useLocalStorage`)
- **Descriptive**: Clearly indicate hook purpose
- **Noun-based**: Hooks return things (`useUser`, `useProducts`, `useTheme`)

```typescript
// ✅ Good
export const useAuth = () => {};
export const useUserProfile = () => {};
export const useLocalStorage = (key: string) => {};

// ❌ Bad
export const useGetUser = () => {}; // "get" is redundant
export const auth = () => {}; // Missing "use" prefix
export const useU = () => {}; // Abbreviation
```

### Hook Return Values

- Use descriptive names for returned values
- Use object destructuring for multiple returns

```typescript
// ✅ Good
export const useAuth = () => {
  return {
    user,
    isLoading,
    error,
    login,
    logout,
  };
};

// Usage
const { user, isLoading, login } = useAuth();

// ❌ Bad
export const useAuth = () => {
  return { a, b, c }; // Not descriptive
};
```

## Type and Interface Naming

### Types and Interfaces

- **PascalCase**: All type/interface names (`User`, `Product`, `ApiResponse`)
- **Descriptive**: Clearly indicate what the type represents
- **Props interfaces**: Suffix with `Props` (`ButtonProps`, `UserCardProps`)

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

type UserRole = 'admin' | 'user' | 'guest';

// ❌ Bad
interface U { // Abbreviation
  id: string;
}

interface Button { // Should be ButtonProps for component props
  onClick: () => void;
}
```

### Generic Types

- Use single uppercase letters (`T`, `K`, `V`) for simple generics
- Use descriptive names for complex generics (`TData`, `TError`)

```typescript
// ✅ Good
function useQuery<TData, TError>(queryKey: string) {}

interface ApiResponse<T> {
  data: T;
  status: number;
}

// ❌ Bad
function useQuery<Data, Error>(queryKey: string) {} // Not conventional
```

## CSS and Style Naming

### CSS Modules

- **camelCase**: CSS class names in modules (`container`, `buttonPrimary`)
- Match component name in file name (`Button.module.css`)

```css
/* Button.module.css */
.container {
  padding: 1rem;
}

.buttonPrimary {
  background: blue;
}

.buttonSecondary {
  background: gray;
}
```

### CSS Class Names (if not using modules)

- **kebab-case**: Traditional CSS class names (`user-profile`, `button-primary`)

```css
.user-profile {
  padding: 1rem;
}

.button-primary {
  background: blue;
}
```

## API and Service Naming

### API Functions

- **camelCase**: API function names (`fetchUser`, `createProduct`, `updateOrder`)
- **Verb-based**: Indicate action (`get`, `post`, `put`, `delete`)

```typescript
// ✅ Good
export const fetchUser = async (id: string) => {};
export const createProduct = async (data: ProductData) => {};
export const updateOrder = async (id: string, data: OrderData) => {};

// ❌ Bad
export const user = async (id: string) => {}; // Not a verb
export const get = async (id: string) => {}; // Too generic
```

### Service Files

- **camelCase** with "Service" suffix (`userService.ts`, `productService.ts`)

```typescript
// userService.ts
export const userService = {
  fetchUser: async (id: string) => {},
  createUser: async (data: UserData) => {},
  updateUser: async (id: string, data: UserData) => {},
};
```

## Test Naming

### Test Files

- Match source file name with `.test` or `.spec` suffix
- `UserProfile.test.tsx` for `UserProfile.tsx`

### Test Descriptions

- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"

```typescript
// ✅ Good
describe('UserProfile', () => {
  it('should display user name when user data is loaded', () => {});
  it('should show loading spinner when data is fetching', () => {});
  it('should display error message when API call fails', () => {});
});

// ❌ Bad
describe('UserProfile', () => {
  it('works', () => {}); // Not descriptive
  it('test 1', () => {}); // Not descriptive
});
```

## Constants Naming

### Constants

- **UPPER_SNAKE_CASE**: Global constants (`API_BASE_URL`, `MAX_RETRIES`)
- **camelCase**: Module-level constants (`defaultConfig`, `initialState`)

```typescript
// ✅ Good
export const API_BASE_URL = 'https://api.example.com';
export const MAX_RETRIES = 3;
export const DEFAULT_TIMEOUT = 5000;

const defaultConfig = {
  timeout: 5000,
};

// ❌ Bad
export const apiBaseUrl = 'https://api.example.com'; // Should be UPPER_SNAKE_CASE
export const maxRetries = 3; // Should be UPPER_SNAKE_CASE
```

## Quick Reference Table

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `UserProfile` |
| Component File | PascalCase | `UserProfile.tsx` |
| Hook | camelCase (use*) | `useAuth` |
| Hook File | camelCase | `useAuth.ts` |
| Function | camelCase | `fetchUser` |
| Variable | camelCase | `userName` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Type/Interface | PascalCase | `User`, `ButtonProps` |
| Folder (feature) | kebab-case | `user-profile/` |
| Folder (component) | PascalCase | `UserProfile/` |
| CSS Module Class | camelCase | `container`, `buttonPrimary` |
| Test File | PascalCase.test | `UserProfile.test.tsx` |

