import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for fade in animation on mount
 */
export const useFadeIn = (duration = 0.8, delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0 },
      { opacity: 1, duration, delay, ease: 'power2.out' }
    );
  }, [duration, delay]);

  return ref;
};

/**
 * Hook for slide in animation from top/bottom/left/right
 */
export const useSlideIn = (direction = 'up', duration = 0.8, delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const getTransform = () => {
      const distance = 40;
      switch (direction) {
        case 'up':
          return { y: distance, opacity: 0 };
        case 'down':
          return { y: -distance, opacity: 0 };
        case 'left':
          return { x: distance, opacity: 0 };
        case 'right':
          return { x: -distance, opacity: 0 };
        default:
          return { y: distance, opacity: 0 };
      }
    };

    gsap.fromTo(
      ref.current,
      getTransform(),
      { x: 0, y: 0, opacity: 1, duration, delay, ease: 'power3.out' }
    );
  }, [duration, delay, direction]);

  return ref;
};

/**
 * Hook for scale animation
 */
export const useScaleIn = (duration = 0.6, delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration, delay, ease: 'back.out(1.7)' }
    );
  }, [duration, delay]);

  return ref;
};

/**
 * Hook for rotation animation
 */
export const useRotateIn = (duration = 0.8, delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { rotation: -180, opacity: 0 },
      { rotation: 0, opacity: 1, duration, delay, ease: 'back.out(1.5)' }
    );
  }, [duration, delay]);

  return ref;
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollAnimation = (animationType = 'fadeIn', options = {}) => {
  const ref = useRef(null);
  const {
    duration = 0.8,
    delay = 0,
    triggerStart = 'top 80%',
    triggerEnd = 'top 50%',
    markers = false,
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    let fromConfig = {};
    let toConfig = { duration, ease: 'power3.out', delay };

    switch (animationType) {
      case 'fadeIn':
        fromConfig = { opacity: 0 };
        toConfig = { ...toConfig, opacity: 1 };
        break;
      case 'slideUp':
        fromConfig = { y: 60, opacity: 0 };
        toConfig = { ...toConfig, y: 0, opacity: 1 };
        break;
      case 'slideDown':
        fromConfig = { y: -60, opacity: 0 };
        toConfig = { ...toConfig, y: 0, opacity: 1 };
        break;
      case 'slideLeft':
        fromConfig = { x: 60, opacity: 0 };
        toConfig = { ...toConfig, x: 0, opacity: 1 };
        break;
      case 'slideRight':
        fromConfig = { x: -60, opacity: 0 };
        toConfig = { ...toConfig, x: 0, opacity: 1 };
        break;
      case 'scaleIn':
        fromConfig = { scale: 0.7, opacity: 0 };
        toConfig = { ...toConfig, scale: 1, opacity: 1 };
        break;
      default:
        fromConfig = { opacity: 0 };
        toConfig = { ...toConfig, opacity: 1 };
    }

    gsap.fromTo(
      ref.current,
      fromConfig,
      {
        ...toConfig,
        scrollTrigger: {
          trigger: ref.current,
          start: triggerStart,
          end: triggerEnd,
          toggleActions: 'play none none none',
          markers,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [animationType, duration, delay, triggerStart, triggerEnd, markers]);

  return ref;
};

/**
 * Hook for hover animations
 */
export const useHoverAnimation = (hoverScale = 1.05, hoverDuration = 0.3) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const handleMouseEnter = () => {
      gsap.to(ref.current, {
        scale: hoverScale,
        duration: hoverDuration,
        overwrite: 'auto',
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(ref.current, {
        scale: 1,
        duration: hoverDuration,
        overwrite: 'auto',
        ease: 'power2.out',
      });
    };

    ref.current.addEventListener('mouseenter', handleMouseEnter);
    ref.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ref.current?.removeEventListener('mouseenter', handleMouseEnter);
      ref.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hoverScale, hoverDuration]);

  return ref;
};

/**
 * Hook for stagger animations (animate multiple elements with delay)
 */
export const useStaggerAnimation = (items = [], duration = 0.6, stagger = 0.1) => {
  const refs = useRef([]);

  useEffect(() => {
    if (!refs.current.length) return;

    gsap.fromTo(
      refs.current.filter(Boolean),
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
      }
    );
  }, [items.length, duration, stagger]);

  return (index) => (el) => {
    if (el) refs.current[index] = el;
  };
};

/**
 * Hook for continuous floating animation
 */
export const useFloat = (distance = 15, duration = 3) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: -distance,
      duration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, [distance, duration]);

  return ref;
};

/**
 * Hook for pulse animation
 */
export const usePulse = (duration = 2) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      opacity: 0.6,
      duration: duration / 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, [duration]);

  return ref;
};

/**
 * Hook for input placeholder focus animation
 * Smoothly animates placeholder when input is focused
 */
export const useInputAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const handleFocus = () => {
      gsap.to(ref.current, {
        boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1), 0 0 0 6px rgba(34, 197, 94, 0.05)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleBlur = () => {
      gsap.to(ref.current, {
        boxShadow: '0 0 0 0px rgba(34, 197, 94, 0)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    ref.current.addEventListener('focus', handleFocus);
    ref.current.addEventListener('blur', handleBlur);

    return () => {
      ref.current?.removeEventListener('focus', handleFocus);
      ref.current?.removeEventListener('blur', handleBlur);
    };
  }, []);

  return ref;
};

/**
 * Hook for skeleton loading animation
 * Creates staggered shimmer effect for multiple skeleton items
 */
export const useSkeletonAnimation = (itemCount = 1) => {
  const refs = useRef([]);

  useEffect(() => {
    const validRefs = refs.current.filter(Boolean);
    if (!validRefs.length) return;

    gsap.to(validRefs, {
      opacity: [0.6, 1],
      duration: 1.5,
      stagger: 0.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, [itemCount]);

  return (index) => (el) => {
    if (el) refs.current[index] = el;
  };
};

export default {
  useFadeIn,
  useSlideIn,
  useScaleIn,
  useRotateIn,
  useScrollAnimation,
  useHoverAnimation,
  useStaggerAnimation,
  useFloat,
  usePulse,
  useInputAnimation,
  useSkeletonAnimation,
};
