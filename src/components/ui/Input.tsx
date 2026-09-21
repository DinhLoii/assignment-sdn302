import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2 text-sm bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500",
            "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-700 hover:border-slate-600",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
