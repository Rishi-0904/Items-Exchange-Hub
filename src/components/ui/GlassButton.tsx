import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-primary-500/20 hover:bg-primary-600/30 text-white border border-primary-400/30',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    danger: 'bg-red-500/20 hover:bg-red-600/30 text-red-100 border border-red-400/30',
    ghost: 'bg-transparent hover:bg-white/5 text-white border border-transparent hover:border-white/10',
  };

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  const widthStyles = fullWidth ? 'w-full' : 'w-auto';
  const opacityStyles = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${opacityStyles} ${className}`}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default GlassButton;
