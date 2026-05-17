# 🚀 Quick Reference Card

## GSAP Animation Hooks - One-Liner Guide

### Import
```jsx
import { 
  useFadeIn, useSlideIn, useScaleIn, useRotateIn, 
  useScrollAnimation, useHoverAnimation, useStaggerAnimation, 
  useFloat, usePulse 
} from '../hooks/useGsapAnimations';
```

---

## Hooks Cheat Sheet

### 1️⃣ Fade In
```jsx
const ref = useFadeIn(duration, delay);
// Example: useFadeIn(0.6, 0.2)
return <div ref={ref}>Fades in</div>;
```

### 2️⃣ Slide In
```jsx
const ref = useSlideIn(direction, duration, delay);
// Directions: 'up' | 'down' | 'left' | 'right'
// Example: useSlideIn('up', 0.8, 0.1)
return <h1 ref={ref}>Slides up</h1>;
```

### 3️⃣ Scale In (Bouncy)
```jsx
const ref = useScaleIn(duration, delay);
// Example: useScaleIn(0.6, 0.1)
return <button ref={ref}>Bouncy entrance</button>;
```

### 4️⃣ Rotate In
```jsx
const ref = useRotateIn(duration, delay);
// Example: useRotateIn(0.8, 0)
return <div ref={ref}>Spins and fades</div>;
```

### 5️⃣ Scroll Animation
```jsx
const ref = useScrollAnimation(type, options);
// Types: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn'
// Example:
const ref = useScrollAnimation('slideUp', {
  duration: 0.8,
  triggerStart: 'top 80%',
  triggerEnd: 'top 50%'
});
return <section ref={ref}>Animates on scroll</section>;
```

### 6️⃣ Hover Animation
```jsx
const ref = useHoverAnimation(scale, duration);
// Example: useHoverAnimation(1.08, 0.3)
return <img ref={ref} src="..." />;
```

### 7️⃣ Stagger Animation
```jsx
const items = [1, 2, 3, 4];
const getRef = useStaggerAnimation(items, duration, stagger);
// Example: useStaggerAnimation(items, 0.6, 0.1)
return (
  <div>
    {items.map((item, i) => (
      <div key={i} ref={getRef(i)}>Item {item}</div>
    ))}
  </div>
);
```

### 8️⃣ Float (Bobbing)
```jsx
const ref = useFloat(distance, duration);
// Example: useFloat(15, 3) // 15px bobbing, 3s cycle
return <div ref={ref}>Floats forever</div>;
```

### 9️⃣ Pulse
```jsx
const ref = usePulse(duration);
// Example: usePulse(2) // 2s pulse cycle
return <div ref={ref}>Pulses</div>;
```

---

## Common Patterns

### Hero Section
```jsx
const titleRef = useSlideIn('down', 0.8, 0);
const subtitleRef = useSlideIn('down', 0.8, 0.2);
const ctaRef = useScaleIn(0.6, 0.4);
```

### Card Grid
```jsx
const cardRef = useScaleIn(0.5, 0);      // Entrance
const imageRef = useHoverAnimation(1.08); // Hover
```

### Scroll Section
```jsx
const ref = useScrollAnimation('slideUp', {
  duration: 0.8,
  triggerStart: 'top 85%'
});
```

### Floating Element
```jsx
const ref = useFloat(20, 4); // 20px distance, 4s duration
```

### Staggered List
```jsx
const getRef = useStaggerAnimation(items, 0.6, 0.1);
// Use: ref={getRef(index)}
```

---

## Parameter Defaults

| Hook | Duration | Delay |
|------|----------|-------|
| `useFadeIn` | 0.8 | 0 |
| `useSlideIn` | 0.8 | 0 |
| `useScaleIn` | 0.6 | 0 |
| `useRotateIn` | 0.8 | 0 |
| `useFloat` | 3 | - |
| `usePulse` | 2 | - |

---

## Best Durations (in seconds)

- **Page load animations**: 0.6 - 0.8s
- **List item stagger**: 0.1 - 0.15s delay between items
- **Hover effects**: 0.2 - 0.3s
- **Scroll animations**: 0.8 - 1.0s
- **Continuous animations** (float, pulse): 2 - 4s

---

## Tailwind Animation Classes

```html
<!-- Fade in -->
<div class="animate-fade-in">Content</div>

<!-- Slide directions -->
<div class="animate-slide-in-up">Slides up</div>
<div class="animate-slide-in-down">Slides down</div>
<div class="animate-slide-in-left">Slides left</div>
<div class="animate-slide-in-right">Slides right</div>

<!-- Scale -->
<div class="animate-scale-in">Scales in</div>

<!-- Float -->
<div class="animate-float">Floats</div>

<!-- Pulse -->
<div class="animate-pulse-soft">Pulses</div>
```

---

## Pro Tips 💡

✅ **Timing**
- Delays create visual hierarchy
- Stagger multiple items (0.1s apart)
- Keep durations under 1s for UI interactions

✅ **Performance**
- Use CSS transforms (scale, translate, rotate)
- Avoid animating layout properties
- Test on mobile devices

✅ **Accessibility**
- Respect `prefers-reduced-motion`
- Don't animate critical content
- Keep animations purposeful

✅ **UX**
- Match animation to interaction
- Use consistent easing
- Combine multiple animations

---

## Responsive Text Sizing

```html
<!-- All text uses clamp() for fluid scaling -->
<h1>28px → 48px</h1>      <!-- Mobile → Desktop -->
<h2>24px → 36px</h2>
<h3>18px → 28px</h3>
<p>14px → 16px</p>        <!-- Body text -->
```

---

## Beautiful Fonts Used

🎯 **Headings**: Poppins (modern, bold)
📝 **Body**: Inter (clean, readable)
✨ **Main Headline**: Playfair Display (elegant)

All from Google Fonts. Automatically scaled based on screen size.

---

## Quick Copy-Paste Template

```jsx
import { useFadeIn, useSlideIn } from '../hooks/useGsapAnimations';

export default function MyComponent() {
  const ref1 = useFadeIn(0.6, 0.2);
  const ref2 = useSlideIn('up', 0.8, 0.4);

  return (
    <div>
      <h1 ref={ref1}>Heading</h1>
      <p ref={ref2}>Content</p>
    </div>
  );
}
```

---

## Troubleshooting

❌ **Animation not playing?**
- Check if ref is attached to element
- Make sure component is mounted
- Check browser console for errors

❌ **Animation jumpy?**
- Reduce duration or delay
- Check for conflicting CSS
- Use `overwrite: 'auto'` in hover animations

❌ **Scroll animation not triggering?**
- Lower `triggerStart` value (try 'top 90%')
- Check element is actually in viewport
- Verify ScrollTrigger is registered

---

## Resources

📖 **Full Guides**:
- `ANIMATION_GUIDE.md` - Detailed documentation
- `ANIMATION_EXAMPLES.md` - 10+ code examples
- `COMPLETION_CHECKLIST.md` - Implementation summary

🔗 **External**:
- [GSAP Docs](https://gsap.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [CSS clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)

---

## One-Shot Examples

### Fade In Hero
```jsx
const ref = useFadeIn(0.8, 0.2);
<h1 ref={ref} className="text-4xl font-bold">Welcome</h1>
```

### Slide In CTA
```jsx
const ref = useSlideIn('up', 0.8, 0.4);
<button ref={ref} className="px-8 py-4 bg-green-700 text-white rounded-xl">Get Started</button>
```

### Hover Image
```jsx
const ref = useHoverAnimation(1.08, 0.3);
<img ref={ref} src="school.jpg" className="rounded-xl" />
```

### Scroll Section
```jsx
const ref = useScrollAnimation('slideUp', { duration: 0.8, triggerStart: 'top 85%' });
<section ref={ref}><h2>Features</h2></section>
```

### Floating Decoration
```jsx
const ref = useFloat(20, 4);
<div ref={ref} className="absolute w-64 h-64 bg-gradient-to-br from-green-300 to-blue-300 rounded-full opacity-20"></div>
```

---

## Version Info

- **GSAP**: Latest
- **React**: 19.2.5
- **Tailwind**: 4.2.4
- **Status**: Production Ready ✅

---

**Print this card and keep it handy! 📋**

*Last Updated: May 2026*
