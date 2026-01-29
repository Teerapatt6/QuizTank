import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  stepInfo?: string;
}

export function SectionHeader({ title, stepInfo }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {stepInfo && (
        <span className="text-sm text-muted-foreground font-medium">{stepInfo}</span>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
