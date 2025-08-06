// ==========================================
// BREAKPOINTS Y UTILIDADES RESPONSIVE
// ==========================================

/**
 * Breakpoints estandarizados del proyecto
 * Basados en Tailwind CSS para consistencia
 */
export const BREAKPOINTS = {
  sm: '640px',   // Móviles grandes / tablets pequeñas
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops / desktops pequeños
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Desktops grandes
} as const;

/**
 * Utilidades para detectar tamaño de pantalla
 */
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<keyof typeof BREAKPOINTS>('sm');

  useEffect(() => {
    const getScreenSize = () => {
      const width = window.innerWidth;
      
      if (width >= 1536) return '2xl';
      if (width >= 1280) return 'xl';
      if (width >= 1024) return 'lg';
      if (width >= 768) return 'md';
      return 'sm';
    };

    const handleResize = () => {
      setScreenSize(getScreenSize());
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(screenSize),
    isLargeDesktop: ['xl', '2xl'].includes(screenSize)
  };
};

/**
 * Hook para manejo de sidebar móvil
 */
export const useMobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useScreenSize();

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  // Auto-cerrar en desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return {
    isOpen,
    toggle,
    close,
    open,
    isMobile
  };
};

/**
 * Clases CSS responsive reutilizables
 */
export const RESPONSIVE_CLASSES = {
  // Containers
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerTight: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  containerWide: 'w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8',

  // Grids comunes
  gridResponsive: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridCards: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
  gridStats: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4',
  gridSidebar: 'grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8',

  // Flex layouts
  flexResponsive: 'flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4',
  flexMobileStack: 'flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3',
  flexCenter: 'flex flex-col items-center justify-center sm:flex-row',

  // Text
  textResponsive: 'text-sm sm:text-base lg:text-lg',
  headingResponsive: 'text-xl sm:text-2xl lg:text-3xl',
  headingLarge: 'text-2xl sm:text-3xl lg:text-4xl',

  // Spacing
  paddingResponsive: 'p-4 sm:p-6 lg:p-8',
  marginResponsive: 'm-4 sm:m-6 lg:m-8',
  gapResponsive: 'gap-4 sm:gap-6 lg:gap-8',

  // Visibility
  hideMobile: 'hidden sm:block',
  hideTablet: 'hidden lg:block',
  showMobileOnly: 'block sm:hidden',
  showTabletOnly: 'hidden sm:block lg:hidden',
  showDesktopOnly: 'hidden lg:block'
} as const;

/**
 * Utilidad para generar clases responsive
 */
export const generateResponsiveClasses = (
  base: string,
  mobile?: string,
  tablet?: string,
  desktop?: string
): string => {
  const classes = [base];
  
  if (mobile) classes.push(`sm:${mobile}`);
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  
  return classes.join(' ');
};

/**
 * Hook para manejar formularios responsive
 */
export const useResponsiveForm = () => {
  const { isMobile, isTablet } = useScreenSize();

  return {
    isMobile,
    isTablet,
    formClasses: generateResponsiveClasses(
      'space-y-4',
      'space-y-4',
      'space-y-6',
      'space-y-6'
    ),
    fieldClasses: generateResponsiveClasses(
      'w-full',
      'w-full',
      'w-full',
      'w-full'
    ),
    buttonClasses: generateResponsiveClasses(
      'w-full',
      'w-full',
      'w-auto',
      'w-auto'
    ),
    gridClasses: generateResponsiveClasses(
      'grid-cols-1',
      'grid-cols-1',
      'grid-cols-2',
      'grid-cols-2'
    )
  };
};

import { useState, useEffect } from 'react';

export default {
  BREAKPOINTS,
  RESPONSIVE_CLASSES,
  useScreenSize,
  useMobileSidebar,
  useResponsiveForm,
  generateResponsiveClasses
};
