# Animation Implementation Examples

This file shows practical examples of how to implement animations throughout the app.

---

## 1. Hero Section with Multiple Animations

```jsx
import { useFadeIn, useSlideIn, useScaleIn, useFloat } from '../hooks/useGsapAnimations';

export default function HeroSection() {
  const headingRef = useSlideIn('down', 0.8, 0);
  const subtitleRef = useSlideIn('down', 0.8, 0.2);
  const ctaRef = useScaleIn(0.6, 0.4);
  const floatingImageRef = useFloat(20, 4);

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-600 opacity-10" />
      
      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 
          ref={headingRef}
          className="text-4xl md:text-6xl font-bold mb-6 text-gray-900"
        >
          Find Your Perfect School
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Compare hundreds of verified schools across Nigeria and make confident decisions
        </p>
        
        <button 
          ref={ctaRef}
          className="px-8 py-4 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition"
        >
          Browse Schools →
        </button>

        {/* Floating Element */}
        <div ref={floatingImageRef} className="mt-20 md:mt-0 md:absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="w-64 h-64 bg-gradient-to-br from-green-300 to-blue-300 rounded-full opacity-20"></div>
        </div>
      </div>
    </section>
  );
}
```

---

## 2. Card Grid with Animations

```jsx
import { useScaleIn, useHoverAnimation } from '../hooks/useGsapAnimations';

function AnimatedCard({ data }) {
  const cardRef = useScaleIn(0.5, 0);
  const imageRef = useHoverAnimation(1.08, 0.3);

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <div className="relative overflow-hidden h-48">
        <img 
          ref={imageRef}
          src={data.image} 
          alt={data.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">{data.title}</h3>
        <p className="text-gray-600 text-sm">{data.description}</p>
      </div>
    </div>
  );
}

export default function CardGrid({ items }) {
  return (
    <div className="grid-responsive">
      {items.map((item) => (
        <AnimatedCard key={item.id} data={item} />
      ))}
    </div>
  );
}
```

---

## 3. Scroll-Triggered Section

```jsx
import { useScrollAnimation } from '../hooks/useGsapAnimations';

export default function FeaturesSection() {
  const ref = useScrollAnimation('slideUp', {
    duration: 0.8,
    triggerStart: 'top 85%',
    triggerEnd: 'top 50%'
  });

  const features = [
    { icon: '🔍', title: 'Smart Search', desc: 'Find schools instantly' },
    { icon: '📊', title: 'Compare', desc: 'Side-by-side comparison' },
    { icon: '✅', title: 'Verified', desc: 'All schools verified' },
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Why Choose Us</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 4. Staggered List Items

```jsx
import { useStaggerAnimation } from '../hooks/useGsapAnimations';

export default function AnimatedList({ items }) {
  const getRef = useStaggerAnimation(items, 0.6, 0.1);

  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li 
          key={item.id}
          ref={getRef(i)}
          className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition"
        >
          <h4 className="font-semibold">{item.title}</h4>
          <p className="text-gray-600 text-sm">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
```

---

## 5. Modal/Dialog with Animations

```jsx
import { useFadeIn, useScaleIn } from '../hooks/useGsapAnimations';
import gsap from 'gsap';
import { useEffect } from 'react';

export default function AnimatedModal({ isOpen, onClose }) {
  const backdropRef = useFadeIn(0.3, 0);
  const modalRef = useScaleIn(0.5, 0.1);

  useEffect(() => {
    if (!isOpen) return;
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    // Animate out
    gsap.to([backdropRef.current, modalRef.current], {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 pointer-events-auto"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to continue?</p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

---

## 6. Hover Card Effect

```jsx
import { useHoverAnimation } from '../hooks/useGsapAnimations';

export default function HoverCard({ title, description, icon: Icon }) {
  const cardRef = useHoverAnimation(1.05, 0.3);

  return (
    <div 
      ref={cardRef}
      className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl cursor-pointer"
    >
      <Icon size={32} className="mb-4" />
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="opacity-90">{description}</p>
    </div>
  );
}
```

---

## 7. Page Transition Animation

```jsx
import { useFadeIn } from '../hooks/useGsapAnimations';
import { useEffect } from 'react';

export default function PageLayout({ children }) {
  const pageRef = useFadeIn(0.5, 0.2);

  return (
    <div ref={pageRef} className="min-h-screen">
      {children}
    </div>
  );
}

// Usage in pages:
// export default function MyPage() {
//   return (
//     <PageLayout>
//       <h1>Page Content</h1>
//     </PageLayout>
//   );
// }
```

---

## 8. Stats Counter with Animation

```jsx
import { useScrollAnimation } from '../hooks/useGsapAnimations';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

function AnimatedCounter({ value, label }) {
  const countRef = useRef(null);
  const containerRef = useScrollAnimation('fadeIn', {
    duration: 0.8,
    triggerStart: 'top 80%'
  });

  useEffect(() => {
    if (!countRef.current) return;

    const obj = { count: 0 };
    gsap.to(obj, {
      count: parseInt(value),
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        countRef.current.textContent = Math.floor(obj.count).toLocaleString();
      }
    });
  }, [value]);

  return (
    <div ref={containerRef} className="text-center">
      <div ref={countRef} className="text-4xl font-bold text-green-700">0</div>
      <p className="text-gray-600 mt-2">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  const stats = [
    { value: 500, label: 'Schools Listed' },
    { value: 10000, label: 'Students Helped' },
    { value: 98, label: '% Satisfaction' },
    { value: 4, label: 'Countries' }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">By The Numbers</h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedCounter key={i} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 9. Navbar with Animations

```jsx
import { useFadeIn, useSlideIn } from '../hooks/useGsapAnimations';

export default function AnimatedNavbar() {
  const navRef = useFadeIn(0.6, 0);
  const logoRef = useSlideIn('right', 0.6, 0);
  const linksRef = useSlideIn('down', 0.8, 0.1);

  return (
    <nav ref={navRef} className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div ref={logoRef} className="font-bold text-2xl text-green-700">
          Logo
        </div>
        
        <div ref={linksRef} className="hidden md:flex gap-6">
          <a href="#" className="hover:text-green-700 transition">Home</a>
          <a href="#" className="hover:text-green-700 transition">Schools</a>
          <a href="#" className="hover:text-green-700 transition">About</a>
          <a href="#" className="hover:text-green-700 transition">Contact</a>
        </div>
        
        <button className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
          Sign In
        </button>
      </div>
    </nav>
  );
}
```

---

## 10. Form with Input Animations

```jsx
import { useState, useRef } from 'react';
import gsap from 'gsap';

export default function AnimatedForm() {
  const [focused, setFocused] = useState(null);
  const inputRefs = useRef({});

  const handleFocus = (name) => {
    setFocused(name);
    gsap.to(inputRefs.current[name], {
      boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1), 0 0 0 0 rgba(34, 197, 94, 0.2)',
      duration: 0.3
    });
  };

  const handleBlur = (name) => {
    setFocused(null);
    gsap.to(inputRefs.current[name], {
      boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)',
      duration: 0.3
    });
  };

  return (
    <form className="max-w-md mx-auto space-y-4">
      {['name', 'email', 'message'].map(field => (
        <div key={field}>
          <label className="block font-semibold mb-2 capitalize">{field}</label>
          <input 
            ref={el => inputRefs.current[field] = el}
            type={field === 'email' ? 'email' : field === 'message' ? 'textarea' : 'text'}
            placeholder={`Enter your ${field}`}
            onFocus={() => handleFocus(field)}
            onBlur={() => handleBlur(field)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>
      ))}
      
      <button 
        type="submit"
        className="w-full px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 active:scale-95 transition"
      >
        Submit
      </button>
    </form>
  );
}
```

---

## Tips & Best Practices

✅ **Always use refs** - Don't animate directly without refs  
✅ **Test on mobile** - Animations should feel smooth  
✅ **Keep delays under 1s** - Too much delay feels unresponsive  
✅ **Use easing functions** - power2.out, back.out(1.7) for natural motion  
✅ **Respect accessibility** - prefers-reduced-motion is respected  
✅ **Combine animations** - Stack multiple hooks for complex effects  
✅ **Performance first** - Use transforms, not layout properties  

---

Copy these examples and adapt them to your components! Start with simple fade-ins and gradually add more complex animations.

**Happy Animating! 🎉**
