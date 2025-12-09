// Premium Design System - Colors, Gradients, Animations
// Professional, modern, and highly polished

export const premiumColors = {
  // Primary Brand
  primary: {
    500: '#6366F1', // Indigo
    600: '#4F46E5',
    700: '#4338CA',
    gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
  },
  
  // Success & Health
  success: {
    500: '#10B981', // Emerald
    600: '#059669',
    gradient: 'linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)'
  },
  
  // Energy & Activity
  energy: {
    500: '#F59E0B', // Amber
    600: '#D97706',
    gradient: 'linear-gradient(135deg, #FAD961 0%, #F76B1C 100%)'
  },
  
  // Premium Gold
  premium: {
    500: '#FCD34D',
    600: '#F59E0B',
    gradient: 'linear-gradient(135deg, #FFD89B 0%, #19547B 100%)'
  },
  
  // Calm & Wellness
  calm: {
    500: '#8B5CF6', // Violet
    600: '#7C3AED',
    gradient: 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)'
  },
  
  // Backgrounds
  bg: {
    primary: '#0F172A', // Slate 900
    secondary: '#1E293B', // Slate 800
    card: 'rgba(255, 255, 255, 0.05)',
    glass: 'rgba(255, 255, 255, 0.1)',
    glassDark: 'rgba(0, 0, 0, 0.2)'
  },
  
  // Text
  text: {
    primary: '#F8FAFC', // Slate 50
    secondary: '#CBD5E1', // Slate 300
    muted: '#94A3B8' // Slate 400
  }
};

export const premiumGradients = {
  aurora: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  sunset: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
  ocean: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
  forest: 'linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)',
  fire: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)',
  royal: 'linear-gradient(135deg, #FFD89B 0%, #19547B 100%)',
  neon: 'linear-gradient(135deg, #F857A6 0%, #FF5858 100%)',
  minimal: 'linear-gradient(135deg, #FDFCFB 0%, #E2D1C3 100%)'
};

export const glassEffect = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

export const premiumShadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
  md: '0 4px 16px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(99, 102, 241, 0.4)',
  glowGreen: '0 0 20px rgba(16, 185, 129, 0.4)',
  glowGold: '0 0 20px rgba(252, 211, 77, 0.4)'
};

export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.5s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 }
    }
  },
  
  slideUp: {
    animation: 'slideUp 0.5s ease-out',
    '@keyframes slideUp': {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    }
  },
  
  scaleIn: {
    animation: 'scaleIn 0.3s ease-out',
    '@keyframes scaleIn': {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 }
    }
  },
  
  pulse: {
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 }
    }
  },
  
  shimmer: {
    animation: 'shimmer 2s infinite',
    '@keyframes shimmer': {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' }
    }
  }
};

export const typography = {
  hero: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.3
  },
  
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  
  body: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6
  },
  
  small: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5
  }
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem'
};

export const borderRadius = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  full: '9999px'
};



