import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border",
        // QuizTank badge variants
        public: "bg-badge-blue text-badge-blue-text border-0",
        private: "bg-badge-gray text-badge-gray-text border-0",
        math: "bg-primary text-primary-foreground border-0",
        subject: "bg-primary text-primary-foreground border-0",
        easy: "bg-badge-green text-badge-green-text border-0",
        medium: "bg-badge-orange text-badge-orange-text border-0",
        hard: "bg-badge-red text-badge-red-text border-0",
        published: "bg-badge-green text-badge-green-text border-0",
        draft: "bg-badge-gray text-badge-gray-text border-0",
        tag: "bg-muted text-foreground border border-border",
        removable: "bg-muted text-foreground border border-border pr-1",
        step: "bg-primary/10 text-primary border-0",
        stepAi: "bg-ai/10 text-ai border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
