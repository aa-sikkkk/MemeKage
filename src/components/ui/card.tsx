import React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
  return (
    <div className={cn("rounded-lg border border-purple-200/20 bg-white/5 shadow-sm", className)} ref={ref} {...props}>
      {children}
    </div>
  )
})

Card.displayName = "Card"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("p-6", className)} ref={ref} {...props}>
        {children}
      </div>
    )
  },
)

CardContent.displayName = "CardContent"
