/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
        // kept for legacy class usage — both resolve to Inter
        poppins: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs:   ['11px',  { lineHeight: '1.5'  }],
        sm:   ['12.5px',{ lineHeight: '1.55' }],
        base: ['14px',  { lineHeight: '1.6'  }],
        lg:   ['15px',  { lineHeight: '1.5'  }],
        xl:   ['17px',  { lineHeight: '1.4'  }],
        '2xl':['19px',  { lineHeight: '1.35' }],
        '3xl':['23px',  { lineHeight: '1.3'  }],
        '4xl':['28px',  { lineHeight: '1.2'  }],
        '5xl':['35px',  { lineHeight: '1.15' }],
        '6xl':['44px',  { lineHeight: '1.1'  }],
        '7xl':['54px',  { lineHeight: '1.05' }],
        '8xl':['68px',  { lineHeight: '1'    }],
        '9xl':['88px',  { lineHeight: '1'    }],
      },
      spacing: {
        'responsive-xs': 'clamp(0.25rem, 1vw, 0.5rem)',
        'responsive-sm': 'clamp(0.5rem, 2vw, 1rem)',
        'responsive-md': 'clamp(1rem, 3vw, 1.5rem)',
        'responsive-lg': 'clamp(1.5rem, 4vw, 2rem)',
        'responsive-xl': 'clamp(2rem, 5vw, 3rem)',
        'responsive-2xl': 'clamp(2.5rem, 8vw, 4rem)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in-up': 'slideInUp 0.6s ease-out',
        'slide-in-down': 'slideInDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'placeholder-shine': 'placeholderShine 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        placeholderShine: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      maxWidth: {
        container: '1400px',
      },
    },
  },
  plugins: [],
}
