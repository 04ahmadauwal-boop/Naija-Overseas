# GSAP Animation Guide

This project uses GSAP (GreenSock Animation Platform) for smooth, professional animations throughout the app. All animations are mobile-responsive and respect accessibility preferences.

## Installation & Setup

GSAP is already installed. Import hooks from:
```javascript
import { useFadeIn, useSlideIn, /* ... */ } from '../hooks/useGsapAnimations';
```

## Available Animation Hooks

### 1. `useFadeIn(duration = 0.8, delay = 0)`
Fades element from opacity 0 to 1 on mount.

```jsx
const ref = useFadeIn(0.6, 0.2); // 0.6s duration, 0.2s delay
return <div ref={ref}>Fades in</div>;
```

### 2. `useSlideIn(direction = 'up', duration = 0.8, delay = 0)`
Slides element in from specified direction.

**Directions**: 'up' | 'down' | 'left' | 'right'

```jsx
const ref = useSlideIn('up', 0.8, 0.1);
return <h1 ref={ref}>Slides up from bottom</h1>;
```

### 3. `useScaleIn(duration = 0.6, delay = 0)`
Scales element from 0.8 to 1 with spring effect.

```jsx
const ref = useScaleIn(0.6, 0.1);
return <button ref={ref}>Bouncy scale in</button>;
```

### 4. `useRotateIn(duration = 0.8, delay = 0)`
Rotates element 360° while fading in.

```jsx
const ref = useRotateIn(0.8, 0);
return <div ref={ref}>Spin to show</div>;
```

### 5. `useScrollAnimation(animationType, options)`
Triggers animation when element scrolls into view.

**Animation Types**: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn'

```jsx
const ref = useScrollAnimation('slideUp', {
  duration: 0.8,
  delay: 0,
  triggerStart: 'top 80%',  // when to start
  triggerEnd: 'top 50%',     // when to end
  markers: false             // debug markers
});
return <section ref={ref}>Animates on scroll</section>;
```

### 6. `useHoverAnimation(hoverScale = 1.05, hoverDuration = 0.3)`
Scales element on hover.

```jsx
const ref = useHoverAnimation(1.08, 0.3); // scale to 1.08x, 0.3s
return <div ref={ref}>Scales on hover</div>;
```

### 7. `useStaggerAnimation(items = [], duration = 0.6, stagger = 0.1)`
Staggers animations of multiple elements.

```jsx
const items = [1, 2, 3, 4];
const getRef = useStaggerAnimation(items, 0.6, 0.1);

return (
  <div>
    {items.map((item, i) => (
      <div key={i} ref={getRef(i)}>Item {item}</div>
    ))}
  </div>
);
```

### 8. `useFloat(distance = 15, duration = 3)`
Continuous floating/bobbing animation.

```jsx
const ref = useFloat(15, 3); // 15px distance, 3s duration
return <div ref={ref}>Floats forever</div>;
```

### 9. `usePulse(duration = 2)`
Continuous pulsing opacity animation.

```jsx
const ref = usePulse(2); // 2s pulse duration
return <div ref={ref}>Pulses</div>;
```

## Best Practices

### 1. Performance
- Use scroll animations sparingly (they listen to scroll events)
- Combine multiple animations on same element using refs
- Kill animations when components unmount (hooks handle this)

### 2. Mobile Optimization
- Reduce duration for mobile: `useSlideIn('up', isMobile ? 0.5 : 0.8)`
- Use scale animations instead of large transforms on mobile
- Test animations on actual devices

### 3. Accessibility
- Respect `prefers-reduced-motion` in globals (CSS handles this)
- Don't animate critical information
- Keep animations under 1s for UI interactions
- Avoid strobing/flickering animations

### 4. Naming & Organization
```jsx
// Good - descriptive refs
const heroHeadingRef = useFadeIn(0.8, 0.2);
const ctaButtonRef = useScaleIn(0.6, 0.5);

// Avoid - vague names
const ref1 = useFadeIn();
const ref2 = useSlideIn('up');
```

## Common Patterns

### Hero Section with Staggered Elements
```jsx
export default function Hero() {
  const titleRef = useSlideIn('down', 0.8, 0);
  const subtitleRef = useSlideIn('down', 0.8, 0.2);
  const ctaRef = useSlideIn('up', 0.8, 0.4);

  return (
    <section>
      <h1 ref={titleRef}>Welcome</h1>
      <p ref={subtitleRef}>Subtitle text</p>
      <button ref={ctaRef}>CTA</button>
    </section>
  );
}
```

### Card Grid with Hover Effects
```jsx
export default function CardGrid({ items }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id} item={item} />
      ))}
    </div>
  );
}

function Card({ item }) {
  const cardRef = useScaleIn(0.5, 0);
  const imageRef = useHoverAnimation(1.08, 0.3);

  return (
    <div ref={cardRef} className="card">
      <img ref={imageRef} src={item.image} />
      <h3>{item.title}</h3>
    </div>
  );
}
```

### List Items Scroll Animation
```jsx
export default function AnimatedList({ items }) {
  const listRef = useScrollAnimation('slideUp', {
    duration: 0.8,
    triggerStart: 'top 85%'
  });

  return (
    <ul ref={listRef} className="space-y-4">
      {items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

## Tailwind Animation Classes

Added custom animations to Tailwind (in `tailwind.config.js`):

```jsx
className="animate-fade-in"       // Fades in
className="animate-slide-in-up"   // Slides up
className="animate-slide-in-down" // Slides down
className="animate-slide-in-left" // Slides left
className="animate-slide-in-right" // Slides right
className="animate-scale-in"      // Scales in
className="animate-float"         // Floats
className="animate-pulse-soft"    // Pulses
```

## Debugging

### Visual Scroll Trigger Markers
```jsx
const ref = useScrollAnimation('slideUp', {
  duration: 0.8,
  markers: true  // Shows start/end points on screen
});
```

### Console Logging
```jsx
useEffect(() => {
  console.log('Animation element:', ref.current);
}, []);
```

## Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 12+)
- Mobile browsers: ✅ Full support (optimized)

## Resources
- [GSAP Docs](https://gsap.com/docs/)
- [ScrollTrigger](https://gsap.com/docs/plugins/ScrollTrigger/)
- [Animation Easing](https://gsap.com/docs/v3/Easing/)

## Troubleshooting

### Animation not playing
- Check if ref is attached to DOM element
- Verify component is mounted
- Check browser console for errors

### Animation jittery/jumpy
- Reduce number of simultaneous animations
- Use `overwrite: 'auto'` in hover animations
- Profile with Chrome DevTools

### Scroll animations not triggering
- Verify element is in viewport during scroll
- Check `triggerStart` value (try 'top 90%')
- Make sure ScrollTrigger is registered

## Advanced Usage

### Custom GSAP Timeline
```jsx
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

export default function ComplexAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .fromTo(containerRef.current, { y: 30 }, { y: 0, duration: 0.6 }, 0);

    return () => tl.kill();
  }, []);

  return <div ref={containerRef}>Complex animation</div>;
}
```

### Combining Multiple Animations
```jsx
const titleRef = useFadeIn(0.6, 0);
const imageRef = useHoverAnimation(1.05, 0.3);

return (
  <div>
    <h1 ref={titleRef}>Title</h1>
    <img ref={imageRef} src="..." />
  </div>
);
```

---

**Last Updated**: May 2026
**GSAP Version**: Latest
**Maintained By**: Dev Team
