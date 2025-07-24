import React, { useEffect, useState } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
  delay?: number;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that delays rendering of children
 * to improve initial page load performance
 */
const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  delay = 50, 
  fallback = null 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Use requestIdleCallback if available, otherwise fall back to setTimeout
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => {
        setShouldRender(true);
      }, { timeout: delay });
      
      return () => {
        if ('cancelIdleCallback' in window) {
          cancelIdleCallback(id);
        }
      };
    } else {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return <>{shouldRender ? children : fallback}</>;
};

export default LazyWrapper;