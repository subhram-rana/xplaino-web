# Performance Optimization

## Performance Principles

1. **Measure First**: Profile before optimizing
2. **Optimize Critical Path**: Focus on user-facing performance
3. **Lazy Load**: Load code and data when needed
4. **Memoize Wisely**: Use memoization where it matters
5. **Avoid Premature Optimization**: Don't optimize until you have metrics

## Code Splitting

### Route-Based Code Splitting

Split code at route level for better initial load:

```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load route components
const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Component-Based Code Splitting

Lazy load heavy components:

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));
const DataTable = lazy(() => import('./DataTable'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Dynamic Imports

Use dynamic imports for conditional loading:

```typescript
const loadFeature = async () => {
  const module = await import('./HeavyFeature');
  return module.default;
};
```

## Memoization

### React.memo

Memoize components that re-render frequently with same props:

```typescript
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function (optional)
  return prevProps.user.id === nextProps.user.id;
});
```

### useMemo

Memoize expensive computations:

```typescript
function ProductList({ products, filters }) {
  // Expensive computation - memoize it
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return filters.every(filter => filter(product));
    });
  }, [products, filters]);

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### useCallback

Memoize function references passed to child components:

```typescript
function Parent({ items }) {
  // Memoize callback to prevent child re-renders
  const handleItemClick = useCallback((id: string) => {
    console.log('Item clicked:', id);
    // Handle click
  }, []); // Empty deps if function doesn't depend on props/state

  return (
    <div>
      {items.map(item => (
        <Child
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
}
```

### When NOT to Memoize

- Don't memoize everything (overhead can outweigh benefits)
- Don't memoize simple computations
- Don't memoize if props change frequently
- Measure first, then optimize

## Virtualization

Use virtualization for long lists:

```typescript
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Item item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

## Image Optimization

### Lazy Loading Images

```typescript
<img
  src={imageSrc}
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

### Responsive Images

```typescript
<img
  srcSet={`
    image-small.jpg 480w,
    image-medium.jpg 768w,
    image-large.jpg 1200w
  `}
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
  src="image-medium.jpg"
  alt="Description"
/>
```

### Image Optimization Libraries

Consider using:
- `next/image` (if using Next.js)
- `react-image` for lazy loading
- `sharp` for server-side optimization

## Bundle Optimization

### Analyze Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Or use webpack-bundle-analyzer
```

### Tree Shaking

- Use ES modules (`import/export`)
- Avoid default exports of large objects
- Use named exports for better tree shaking

```typescript
// ✅ Good: Named exports
export const util1 = () => {};
export const util2 = () => {};

// ❌ Bad: Default export of object
export default { util1, util2 };
```

### Remove Unused Dependencies

Regularly audit and remove unused dependencies:

```bash
npm install -g depcheck
depcheck
```

## React Performance Patterns

### Avoid Inline Functions in JSX

```typescript
// ❌ Bad: Creates new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good: Memoized callback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
<button onClick={handleClick}>Click</button>
```

### Avoid Inline Objects

```typescript
// ❌ Bad: Creates new object on every render
<div style={{ margin: '10px' }} />

// ✅ Good: Extract to constant or use CSS
const style = { margin: '10px' };
<div style={style} />
```

### Key Props

Always provide stable, unique keys:

```typescript
// ✅ Good: Stable unique key
{items.map(item => (
  <Item key={item.id} item={item} />
))}

// ❌ Bad: Index as key (unless list is static)
{items.map((item, index) => (
  <Item key={index} item={item} />
))}
```

## State Management Performance

### Context Optimization

Split contexts to reduce re-renders:

```typescript
// ❌ Bad: Single large context
const AppContext = createContext({ user, theme, settings, ... });

// ✅ Good: Split by concern
const UserContext = createContext({ user });
const ThemeContext = createContext({ theme });
const SettingsContext = createContext({ settings });
```

### Memoize Context Values

```typescript
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Memoize context value
  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Performance Monitoring

### React Profiler

Use React DevTools Profiler to identify bottlenecks:

```typescript
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id);
  console.log('Phase:', phase);
  console.log('Duration:', actualDuration);
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

### Performance Metrics

Track Core Web Vitals:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Performance Budgets

Set performance budgets in build config:

```javascript
// vite.config.ts or webpack.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB
  },
};
```

## Best Practices Checklist

- [ ] Implement code splitting for routes
- [ ] Lazy load heavy components
- [ ] Use React.memo for expensive components
- [ ] Memoize expensive computations with useMemo
- [ ] Memoize callbacks with useCallback
- [ ] Optimize images (lazy loading, responsive)
- [ ] Use virtualization for long lists
- [ ] Split contexts by concern
- [ ] Memoize context values
- [ ] Analyze bundle size regularly
- [ ] Remove unused dependencies
- [ ] Monitor Core Web Vitals
- [ ] Profile before optimizing
- [ ] Test performance on slow devices/networks




