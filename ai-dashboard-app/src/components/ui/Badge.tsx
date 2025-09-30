import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold transition-colors',
          {
            'bg-primary-100 text-primary-700 border border-primary-200': variant === 'default',
            'bg-success-light text-success-dark border border-success': variant === 'success',
            'bg-warning-light text-warning-dark border border-warning': variant === 'warning',
            'bg-error-light text-error-dark border border-error': variant === 'error',
            'bg-info-light text-info-dark border border-info': variant === 'info',
            'bg-transparent border-2 border-clinical-border text-neutral-700': variant === 'outline',
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-3 py-1 text-sm': size === 'md',
            'px-4 py-1.5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
