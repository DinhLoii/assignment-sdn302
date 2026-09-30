import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="ml-1 text-rose-500">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full resize-y rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500",
            "transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
