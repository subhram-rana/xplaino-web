# Responsive Design Patterns

## Core Principles

1. **Mobile-First Approach**: Design for mobile devices first, then enhance for larger screens
2. **Fluid Layouts**: Use relative units (%, rem, em, vw, vh) instead of fixed pixels
3. **Flexible Images**: Ensure images scale appropriately across all devices
4. **Touch-Friendly**: Minimum touch target size of 44x44px for interactive elements
5. **Performance**: Optimize assets for different screen densities (1x, 2x, 3x)
6. **Progressive Enhancement**: Start with core functionality, enhance for capable devices

## Breakpoint Strategy

### Standard Breakpoints

Define breakpoints consistently across the application:

```typescript
// constants/breakpoints.ts
export const breakpoints = {
  // Mobile (portrait)
  xs: '320px',   // Small phones
  sm: '375px',   // Standard phones
  md: '425px',   // Large phones
  
  // Tablet (portrait)
  lg: '768px',   // Tablets
  
  // Tablet (landscape) / Small desktop
  xl: '1024px',  // Tablets landscape, small laptops
  
  // Desktop
  '2xl': '1280px',  // Standard desktops
  '3xl': '1440px',  // Large desktops
  '4xl': '1920px',  // Extra large desktops
  '5xl': '2560px',  // Ultra-wide displays
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Media query helpers
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  '3xl': `(min-width: ${breakpoints['3xl']})`,
  '4xl': `(min-width: ${breakpoints['4xl']})`,
  '5xl': `(min-width: ${breakpoints['5xl']})`,
  
  // Orientation queries
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  
  // Device-specific
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;
```

### CSS-in-JS / Tailwind Breakpoints

```typescript
// For Tailwind CSS configuration
export const tailwindBreakpoints = {
  xs: '320px',
  sm: '375px',
  md: '425px',
  lg: '768px',
  xl: '1024px',
  '2xl': '1280px',
  '3xl': '1440px',
  '4xl': '1920px',
  '5xl': '2560px',
};
```

## Responsive Hooks

### useMediaQuery Hook

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};

// Usage
const isMobile = useMediaQuery('(max-width: 767px)');
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');
const isLandscape = useMediaQuery('(orientation: landscape)');
```

### useBreakpoint Hook

```typescript
// hooks/useBreakpoint.ts
import { useMediaQuery } from './useMediaQuery';
import { breakpoints } from '../constants/breakpoints';

export const useBreakpoint = (): Breakpoint => {
  const isXs = useMediaQuery(`(min-width: ${breakpoints.xs})`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`);
  const is2Xl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`);
  const is3Xl = useMediaQuery(`(min-width: ${breakpoints['3xl']})`);
  const is4Xl = useMediaQuery(`(min-width: ${breakpoints['4xl']})`);
  const is5Xl = useMediaQuery(`(min-width: ${breakpoints['5xl']})`);

  if (is5Xl) return '5xl';
  if (is4Xl) return '4xl';
  if (is3Xl) return '3xl';
  if (is2Xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
};

// Usage
const breakpoint = useBreakpoint();
const isMobile = ['xs', 'sm', 'md'].includes(breakpoint);
```

### useViewport Hook

```typescript
// hooks/useViewport.ts
import { useState, useEffect } from 'react';

interface Viewport {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
}

export const useViewport = (): Viewport => {
  const [viewport, setViewport] = useState<Viewport>(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        isLandscape: window.innerWidth > window.innerHeight,
      };
    }
    return {
      width: 0,
      height: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isLandscape: false,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        isLandscape: window.innerWidth > window.innerHeight,
      });
    };

    // Throttle resize events for performance
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewport;
};
```

## Responsive Component Patterns

### 1. Conditional Rendering Based on Screen Size

```typescript
// components/ResponsiveLayout.tsx
import { useViewport } from '@/hooks/useViewport';

export const ResponsiveLayout: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useViewport();

  return (
    <>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </>
  );
};
```

### 2. Responsive Props Pattern

```typescript
// components/Grid.tsx
interface GridProps {
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({ 
  columns = 1, 
  gap = 16,
  children 
}) => {
  const breakpoint = useBreakpoint();
  
  const getColumns = (): number => {
    if (typeof columns === 'number') return columns;
    return columns[breakpoint] ?? columns.xs ?? 1;
  };
  
  const getGap = (): number => {
    if (typeof gap === 'number') return gap;
    return gap[breakpoint] ?? gap.xs ?? 16;
  };

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
        gap: `${getGap()}px`,
      }}
    >
      {children}
    </div>
  );
};

// Usage
<Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
  {items.map(item => <Card key={item.id} {...item} />)}
</Grid>
```

### 3. Responsive Container Component

```typescript
// components/Container.tsx
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  children: React.ReactNode;
}

const maxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'xl',
  padding = { xs: 16, sm: 24, md: 32, lg: 40 },
  children,
}) => {
  const breakpoint = useBreakpoint();
  
  const getPadding = (): number => {
    if (typeof padding === 'number') return padding;
    return padding[breakpoint] ?? padding.xs ?? 16;
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxWidths[maxWidth],
        margin: '0 auto',
        padding: `0 ${getPadding()}px`,
      }}
    >
      {children}
    </div>
  );
};
```

### 4. Responsive Typography

```typescript
// components/ResponsiveText.tsx
interface ResponsiveTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  weight?: number | string;
  children: React.ReactNode;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  as: Component = 'p',
  size = { xs: '14px', sm: '16px', md: '18px', lg: '20px' },
  weight = 'normal',
  children,
}) => {
  const breakpoint = useBreakpoint();
  
  const getSize = (): string => {
    return size[breakpoint] ?? size.xs ?? '14px';
  };

  return (
    <Component
      style={{
        fontSize: getSize(),
        fontWeight: weight,
      }}
    >
      {children}
    </Component>
  );
};
```

## CSS Patterns

### Mobile-First CSS (CSS Modules)

```css
/* Component.module.css */

/* Mobile styles (default) */
.container {
  padding: 16px;
  font-size: 14px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.button {
  width: 100%;
  min-height: 44px; /* Touch target */
  padding: 12px 16px;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    font-size: 16px;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .button {
    width: auto;
    min-width: 120px;
  }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    font-size: 18px;
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

/* Large Desktop (1440px and up) */
@media (min-width: 1440px) {
  .container {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
  }
}

/* Landscape orientation */
@media (orientation: landscape) and (max-height: 500px) {
  .container {
    padding: 12px;
  }
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: 48px; /* Larger touch target */
  }
  
  .interactive {
    -webkit-tap-highlight-color: transparent;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Fluid Typography (CSS)

```css
/* Use clamp() for fluid typography */
.heading {
  font-size: clamp(24px, 4vw + 1rem, 48px);
  line-height: 1.2;
}

.body {
  font-size: clamp(14px, 2vw + 0.5rem, 18px);
  line-height: 1.6;
}

/* Or use viewport units with min/max */
.subheading {
  font-size: min(max(18px, 2.5vw), 32px);
}
```

### Responsive Images

```typescript
// components/ResponsiveImage.tsx
interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  srcSet,
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  alt,
  loading = 'lazy',
  className,
}) => {
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={loading}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
      }}
    />
  );
};

// Usage with srcSet
<ResponsiveImage
  src="/image-small.jpg"
  srcSet="/image-small.jpg 320w, /image-medium.jpg 768w, /image-large.jpg 1024w, /image-xlarge.jpg 1920w"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
/>
```

## Layout Patterns

### 1. Responsive Grid Layout

```typescript
// components/ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  minItemWidth = 280,
  gap = 24,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};
```

### 2. Responsive Flexbox Layout

```typescript
// components/ResponsiveFlex.tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Breakpoint } from '@/constants/breakpoints';

interface ResponsiveFlexProps {
  direction?: 'row' | 'column' | { xs?: 'row' | 'column'; sm?: 'row' | 'column'; md?: 'row' | 'column'; lg?: 'row' | 'column'; xl?: 'row' | 'column' };
  wrap?: boolean | { xs?: boolean; sm?: boolean; md?: boolean; lg?: boolean; xl?: boolean };
  gap?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline' | { xs?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'; sm?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'; md?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'; lg?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'; xl?: 'start' | 'center' | 'end' | 'stretch' | 'baseline' };
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' | { xs?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'; sm?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'; md?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'; lg?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'; xl?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' };
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  direction = 'row',
  wrap = false,
  gap = 16,
  align = 'stretch',
  justify = 'start',
  children,
  className,
  style,
}) => {
  const breakpoint = useBreakpoint();

  const getDirection = (): 'row' | 'column' => {
    if (typeof direction === 'string') return direction;
    return direction[breakpoint] ?? direction.xs ?? 'row';
  };

  const getWrap = (): boolean => {
    if (typeof wrap === 'boolean') return wrap;
    return wrap[breakpoint] ?? wrap.xs ?? false;
  };

  const getGap = (): number => {
    if (typeof gap === 'number') return gap;
    return gap[breakpoint] ?? gap.xs ?? 16;
  };

  const getAlign = (): string => {
    if (typeof align === 'string') return align;
    return align[breakpoint] ?? align.xs ?? 'stretch';
  };

  const getJustify = (): string => {
    if (typeof justify === 'string') return justify;
    return justify[breakpoint] ?? justify.xs ?? 'start';
  };

  const flexAlignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  const flexJustifyMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: getDirection(),
        flexWrap: getWrap() ? 'wrap' : 'nowrap',
        gap: `${getGap()}px`,
        alignItems: flexAlignMap[getAlign()] || getAlign(),
        justifyContent: flexJustifyMap[getJustify()] || getJustify(),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Usage examples
// Basic usage
<ResponsiveFlex gap={16} align="center" justify="space-between">
  <div>Item 1</div>
  <div>Item 2</div>
</ResponsiveFlex>

// Responsive direction (column on mobile, row on desktop)
<ResponsiveFlex direction={{ xs: 'column', lg: 'row' }} gap={{ xs: 12, lg: 24 }}>
  <div>Item 1</div>
  <div>Item 2</div>
</ResponsiveFlex>

// Responsive gap and alignment
<ResponsiveFlex
  gap={{ xs: 8, sm: 12, md: 16, lg: 24 }}
  align={{ xs: 'start', md: 'center' }}
  justify={{ xs: 'start', lg: 'space-between' }}
  wrap={{ xs: true, lg: false }}
>
  {items.map(item => <Card key={item.id} {...item} />)}
</ResponsiveFlex>
```

### 3. Responsive Spacing Utility

```typescript
// components/ResponsiveSpacing.tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Breakpoint } from '@/constants/breakpoints';

interface ResponsiveSpacingProps {
  padding?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  margin?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  paddingX?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  paddingY?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  marginX?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  marginY?: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string };
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  padding,
  margin,
  paddingX,
  paddingY,
  marginX,
  marginY,
  children,
  className,
  style,
}) => {
  const breakpoint = useBreakpoint();

  const getValue = (
    value: number | string | { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string } | undefined,
    defaultValue: number | string = 0
  ): string => {
    if (value === undefined) return typeof defaultValue === 'number' ? `${defaultValue}px` : defaultValue;
    if (typeof value === 'number') return `${value}px`;
    if (typeof value === 'string') return value;
    const breakpointValue = value[breakpoint] ?? value.xs;
    if (breakpointValue === undefined) return typeof defaultValue === 'number' ? `${defaultValue}px` : defaultValue;
    return typeof breakpointValue === 'number' ? `${breakpointValue}px` : breakpointValue;
  };

  const computedStyle: React.CSSProperties = {
    ...(padding && { padding: getValue(padding) }),
    ...(margin && { margin: getValue(margin) }),
    ...(paddingX && { paddingLeft: getValue(paddingX), paddingRight: getValue(paddingX) }),
    ...(paddingY && { paddingTop: getValue(paddingY), paddingBottom: getValue(paddingY) }),
    ...(marginX && { marginLeft: getValue(marginX), marginRight: getValue(marginX) }),
    ...(marginY && { marginTop: getValue(marginY), marginBottom: getValue(marginY) }),
    ...style,
  };

  return (
    <div className={className} style={computedStyle}>
      {children}
    </div>
  );
};

// Usage examples
// Responsive padding
<ResponsiveSpacing padding={{ xs: 16, sm: 24, md: 32, lg: 40 }}>
  <Content />
</ResponsiveSpacing>

// Responsive margin
<ResponsiveSpacing margin={{ xs: 8, md: 16, lg: 24 }}>
  <Card />
</ResponsiveSpacing>

// Responsive horizontal padding
<ResponsiveSpacing paddingX={{ xs: 16, lg: 32 }} paddingY={{ xs: 12, lg: 24 }}>
  <Container />
</ResponsiveSpacing>
```

### 4. Responsive Visibility Component

```typescript
// components/ResponsiveVisibility.tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Breakpoint } from '@/constants/breakpoints';

interface ResponsiveVisibilityProps {
  show?: Breakpoint | Breakpoint[] | { above?: Breakpoint; below?: Breakpoint };
  hide?: Breakpoint | Breakpoint[] | { above?: Breakpoint; below?: Breakpoint };
  children: React.ReactNode;
}

const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

const getBreakpointIndex = (bp: Breakpoint): number => {
  return breakpointOrder.indexOf(bp);
};

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  show,
  hide,
  children,
}) => {
  const currentBreakpoint = useBreakpoint();
  const currentIndex = getBreakpointIndex(currentBreakpoint);

  const shouldShow = (): boolean => {
    // If hide is specified, it takes precedence
    if (hide !== undefined) {
      if (typeof hide === 'string') {
        return currentBreakpoint !== hide;
      }
      if (Array.isArray(hide)) {
        return !hide.includes(currentBreakpoint);
      }
      if (hide.above) {
        return currentIndex <= getBreakpointIndex(hide.above);
      }
      if (hide.below) {
        return currentIndex >= getBreakpointIndex(hide.below);
      }
    }

    // If show is specified
    if (show !== undefined) {
      if (typeof show === 'string') {
        return currentBreakpoint === show;
      }
      if (Array.isArray(show)) {
        return show.includes(currentBreakpoint);
      }
      if (show.above) {
        return currentIndex >= getBreakpointIndex(show.above);
      }
      if (show.below) {
        return currentIndex <= getBreakpointIndex(show.below);
      }
    }

    // Default: show if no conditions specified
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return <>{children}</>;
};

// Usage examples
// Show only on mobile
<ResponsiveVisibility show={['xs', 'sm', 'md']}>
  <MobileMenu />
</ResponsiveVisibility>

// Hide on mobile, show on desktop
<ResponsiveVisibility hide={{ below: 'lg' }}>
  <DesktopNavigation />
</ResponsiveVisibility>

// Show above tablet
<ResponsiveVisibility show={{ above: 'lg' }}>
  <Sidebar />
</ResponsiveVisibility>

// Hide on specific breakpoints
<ResponsiveVisibility hide={['sm', 'md']}>
  <SpecialContent />
</ResponsiveVisibility>
```

## Responsive Navigation Patterns

### 1. Hamburger Menu Pattern

```typescript
// components/ResponsiveNavigation.tsx
import { useState } from 'react';
import { useViewport } from '@/hooks/useViewport';
import { ResponsiveFlex } from './ResponsiveFlex';
import { ResponsiveVisibility } from './ResponsiveVisibility';

export const ResponsiveNavigation: React.FC = () => {
  const { isMobile } = useViewport();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav>
      <ResponsiveFlex justify={{ xs: 'space-between', lg: 'start' }} align="center">
        {/* Logo */}
        <div>Logo</div>

        {/* Desktop Navigation */}
        <ResponsiveVisibility hide={{ below: 'lg' }}>
          <ResponsiveFlex gap={24}>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/services">Services</a>
            <a href="/contact">Contact</a>
          </ResponsiveFlex>
        </ResponsiveVisibility>

        {/* Mobile Menu Button */}
        <ResponsiveVisibility show={{ below: 'lg' }}>
          <button onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </ResponsiveVisibility>
      </ResponsiveFlex>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <ResponsiveFlex direction="column" gap={16} style={{ marginTop: '16px' }}>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/contact">Contact</a>
        </ResponsiveFlex>
      )}
    </nav>
  );
};
```

### 2. Drawer/Sidebar Navigation

```typescript
// components/DrawerNavigation.tsx
import { useState } from 'react';
import { useViewport } from '@/hooks/useViewport';
import { ResponsiveFlex } from './ResponsiveFlex';

interface DrawerNavigationProps {
  children: React.ReactNode;
}

export const DrawerNavigation: React.FC<DrawerNavigationProps> = ({ children }) => {
  const { isMobile } = useViewport();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Menu</button>
        {isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '80%',
              maxWidth: '300px',
              height: '100vh',
              backgroundColor: '#fff',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              padding: '24px',
            }}
          >
            <button onClick={() => setIsOpen(false)} style={{ marginBottom: '24px' }}>
              Close
            </button>
            {children}
          </div>
        )}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
          />
        )}
      </>
    );
  }

  return (
    <aside
      style={{
        width: '250px',
        minHeight: '100vh',
        padding: '24px',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      {children}
    </aside>
  );
};
```

### 3. Tab Navigation (Mobile) / Horizontal Navigation (Desktop)

```typescript
// components/ResponsiveTabNavigation.tsx
import { ResponsiveFlex } from './ResponsiveFlex';
import { ResponsiveVisibility } from './ResponsiveVisibility';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ResponsiveTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const ResponsiveTabNavigation: React.FC<ResponsiveTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <>
      {/* Mobile: Bottom Tab Bar */}
      <ResponsiveVisibility show={{ below: 'lg' }}>
        <ResponsiveFlex
          justify="space-around"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #e0e0e0',
            padding: '12px 0',
            zIndex: 100,
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: activeTab === tab.id ? '#f0f0f0' : 'transparent',
                borderRadius: '8px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </ResponsiveFlex>
      </ResponsiveVisibility>

      {/* Desktop: Horizontal Tab Bar */}
      <ResponsiveVisibility show={{ above: 'lg' }}>
        <ResponsiveFlex gap={8} style={{ borderBottom: '2px solid #e0e0e0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </ResponsiveFlex>
      </ResponsiveVisibility>

      {/* Tab Content */}
      <div style={{ padding: '24px 0' }}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </>
  );
};
```

## Best Practices

### 1. Performance Considerations

- **Throttle Resize Events**: Always throttle or debounce resize event handlers to avoid performance issues
- **Use CSS Media Queries When Possible**: Prefer CSS media queries over JavaScript for simple responsive styles
- **Lazy Load Images**: Use lazy loading for images, especially on mobile devices
- **Optimize Breakpoint Detection**: Use `useBreakpoint` hook instead of multiple `useMediaQuery` calls when checking multiple breakpoints

```typescript
// ❌ Bad: Multiple useMediaQuery calls
const isMobile = useMediaQuery('(max-width: 767px)');
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');

// ✅ Good: Single useBreakpoint call
const breakpoint = useBreakpoint();
const isMobile = ['xs', 'sm', 'md'].includes(breakpoint);
const isTablet = breakpoint === 'lg';
const isDesktop = ['xl', '2xl', '3xl', '4xl', '5xl'].includes(breakpoint);
```

### 2. Component Design Patterns

- **Consistent Prop Patterns**: Use the same responsive prop pattern across components (single value or object with breakpoint keys)
- **Default Values**: Always provide sensible defaults for responsive props
- **Fallback Strategy**: Implement fallback logic that cascades from larger to smaller breakpoints

```typescript
// ✅ Good: Proper fallback strategy
const getValue = (value: number | ResponsiveValue, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  return value[breakpoint] ?? value.xs ?? defaultValue;
};
```

### 3. Testing Responsive Designs

- **Test on Real Devices**: Always test on actual devices, not just browser dev tools
- **Test All Breakpoints**: Ensure components work correctly at all defined breakpoints
- **Test Orientation Changes**: Verify behavior when device orientation changes
- **Test Touch Interactions**: Ensure touch targets are appropriately sized (minimum 44x44px)

### 4. Accessibility

- **Maintain Focus Order**: Ensure focus order makes sense across all screen sizes
- **Touch Target Sizes**: Maintain minimum 44x44px touch targets on mobile
- **Screen Reader Support**: Use semantic HTML and ARIA attributes appropriately
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible

### 5. Common Pitfalls to Avoid

- **Don't Hide Important Content**: Avoid hiding critical content on mobile using `display: none` - use `ResponsiveVisibility` component instead
- **Don't Overuse JavaScript**: Prefer CSS solutions for simple responsive behavior
- **Don't Create Too Many Breakpoints**: Stick to the defined breakpoint system
- **Don't Forget Landscape Mode**: Consider landscape orientation for mobile devices
- **Don't Ignore Performance**: Monitor bundle size and runtime performance on mobile devices

### 6. Code Organization

- **Centralize Breakpoints**: Define all breakpoints in a single constants file
- **Reusable Components**: Create reusable responsive components rather than duplicating logic
- **Consistent Naming**: Use consistent naming conventions for responsive props
- **Documentation**: Document responsive behavior in component prop types and JSDoc comments

### 7. Progressive Enhancement

- **Start with Mobile**: Design and implement mobile-first, then enhance for larger screens
- **Graceful Degradation**: Ensure core functionality works even if JavaScript fails
- **Feature Detection**: Use feature detection rather than device detection
- **Fallback Styles**: Provide fallback styles for older browsers

### 8. Responsive Typography

- **Use Relative Units**: Prefer `rem` and `em` over `px` for typography
- **Fluid Typography**: Use `clamp()` for fluid typography that scales smoothly
- **Readable Line Lengths**: Maintain 45-75 characters per line for optimal readability
- **Hierarchy**: Maintain clear visual hierarchy across all screen sizes

### 9. Layout Considerations

- **Avoid Horizontal Scrolling**: Ensure content doesn't cause horizontal scrolling on any device
- **Consistent Spacing**: Use the spacing system consistently across breakpoints
- **Flexible Grids**: Use flexible grid systems that adapt to container width
- **Content Reflow**: Ensure content reflows naturally on smaller screens

### 10. Mobile-Specific Considerations

- **Viewport Meta Tag**: Always include proper viewport meta tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

- **Safe Areas**: Consider device safe areas (notches, status bars) in your layouts
- **Touch Gestures**: Support common touch gestures (swipe, pinch, etc.) where appropriate
- **Performance**: Optimize for slower mobile connections and devices