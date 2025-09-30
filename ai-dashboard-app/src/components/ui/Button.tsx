import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg active:scale-[0.98]',
        secondary: 'bg-clinical-white border-2 border-clinical-border text-neutral-700 hover:bg-clinical-light hover:border-primary-300 shadow-sm hover:shadow-md',
        accent: 'bg-gradient-to-r from-accent-cyan-500 to-accent-cyan-600 text-white hover:from-accent-cyan-600 hover:to-accent-cyan-700 shadow-md hover:shadow-lg active:scale-[0.98]',
        ghost: 'text-neutral-700 hover:bg-clinical-light hover:text-primary-600',
        danger: 'bg-error text-white hover:bg-error-dark shadow-md hover:shadow-lg active:scale-[0.98]',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-13 px-7 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={`${buttonVariants({ variant, size, className })} ${isLoading ? 'relative' : ''}`}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
