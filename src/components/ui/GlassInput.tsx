import React, { InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-white/80 mb-1.5 pl-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-white/60">{icon}</span>
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all duration-200 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;
