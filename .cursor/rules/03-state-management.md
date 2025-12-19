# State Management Patterns

## State Management Strategy

Choose the right state management solution based on scope and complexity:

1. **Local State** → `useState` / `useReducer`
2. **Component Tree State** → Context API
3. **Global Application State** → Redux / Zustand / Jotai
4. **Server State** → React Query / SWR / Apollo Client

## 1. Local State (useState / useReducer)

### When to Use
- State specific to a single component
- Simple state updates
- No need to share across components

### useState Pattern

```typescript
// Simple state
const [count, setCount] = useState<number>(0);

// State with initializer function (for expensive computations)
const [data, setData] = useState<Data>(() => {
  return computeInitialData();
});

// Object state
const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
});

// Update object state (immutable)
setForm(prev => ({ ...prev, name: 'New Name' }));
```

### useReducer Pattern

Use `useReducer` for complex state logic with multiple sub-values or when next state depends on previous:

```typescript
interface State {
  count: number;
  step: number;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setStep'; payload: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'reset':
      return { ...state, count: 0 };
    case 'setStep':
      return { ...state, step: action.payload };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
```

## 2. Context API

### When to Use
- State shared within a component tree
- Theme, authentication, user preferences
- Avoid prop drilling
- **Not for high-frequency updates** (performance concerns)

### Context Pattern

```typescript
// 1. Define context and types
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Create provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Create custom hook for consuming context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Context Best Practices

- Split contexts by concern (don't create one giant context)
- Memoize context values to prevent unnecessary re-renders
- Create custom hooks for context consumption
- Provide default values and error handling

## 3. Global State Management

### Redux Toolkit (Recommended for Redux)

When to use:
- Complex application state
- Time-travel debugging needed
- Large team with established patterns
- State needs to be serialized/persisted

```typescript
// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
```

### Zustand (Lightweight Alternative)

When to use:
- Simpler API than Redux
- Less boilerplate
- Good for medium-sized applications

```typescript
// store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

// Usage in component
const { user, setUser } = useUserStore();
```

## 4. Server State Management

### React Query / TanStack Query (Recommended)

When to use:
- API data fetching
- Caching and synchronization
- Background updates
- Optimistic updates

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      // Handle error
      console.error('Failed to create user:', error);
    },
  });
};
```

### React Query Best Practices

- Use descriptive query keys
- Set appropriate `staleTime` and `cacheTime`
- Use `useMutation` for create/update/delete operations
- Implement optimistic updates for better UX
- Handle loading and error states

## State Management Decision Tree

```
Is state only used in one component?
├─ Yes → useState / useReducer
└─ No → Is state shared across component tree?
    ├─ Yes → Is it theme/auth/preferences?
    │   ├─ Yes → Context API
    │   └─ No → Is it server data?
    │       ├─ Yes → React Query / SWR
    │       └─ No → Is it complex global state?
    │           ├─ Yes → Redux / Zustand
    │           └─ No → Context API or Zustand
```

## State Management Best Practices

### 1. Immutability

Always treat state as immutable:

```typescript
// ✅ Good: Create new object/array
setUsers([...users, newUser]);
setForm({ ...form, name: 'New Name' });

// ❌ Bad: Mutate directly
users.push(newUser);
form.name = 'New Name';
```

### 2. Normalize State Shape

Keep state normalized (flat structure):

```typescript
// ✅ Good: Normalized
{
  users: {
    byId: { '1': {...}, '2': {...} },
    allIds: ['1', '2']
  }
}

// ❌ Bad: Nested
{
  users: [
    { id: 1, posts: [...] },
    { id: 2, posts: [...] }
  ]
}
```

### 3. Selectors

Use selectors to derive state:

```typescript
// Redux selector
const selectActiveUsers = (state: RootState) =>
  state.users.allIds
    .map(id => state.users.byId[id])
    .filter(user => user.active);

// React Query selector
const { data: activeUsers } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  select: (data) => data.filter(user => user.active),
});
```

### 4. Avoid Over-Engineering

- Start with local state (`useState`)
- Move to Context if needed
- Add global state management only when necessary
- Use React Query for server state from the start

### 5. State Colocation

Keep state as close to where it's used as possible:

```typescript
// ✅ Good: State close to usage
const FeatureComponent = () => {
  const [localState, setLocalState] = useState();
  // Use localState here
};

// ❌ Bad: Unnecessary global state
// Store in global state when only used in one component
```

## Performance Considerations

1. **Memoize context values** to prevent unnecessary re-renders
2. **Split contexts** by concern to reduce re-render scope
3. **Use selectors** to subscribe to specific state slices
4. **Debounce/throttle** frequent state updates
5. **Lazy load** state management libraries if possible



