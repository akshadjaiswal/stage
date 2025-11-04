import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassInputWrapperProps extends React.ComponentProps<"div"> {
  /**
   * Whether to apply the glass morphism effect
   * @default true
   */
  enabled?: boolean
  /**
   * Border intensity - controls the opacity of the border
   * @default "default" - moderate intensity
   */
  intensity?: "subtle" | "default" | "strong"
}

/**
 * Glass morphism wrapper component for input fields
 * Provides a reusable glass morphism border effect with backdrop blur
 */
function GlassInputWrapper({ 
  className, 
  enabled = true,
  intensity = "default",
  children,
  ...props 
}: GlassInputWrapperProps) {
  if (!enabled) {
    return <div className={className} {...props}>{children}</div>
  }

  const intensityClasses = {
    subtle: {
      border: "border-white/15 dark:border-white/8",
      bg: "bg-white/5 dark:bg-white/3",
      glow: "from-white/8 dark:from-white/4"
    },
    default: {
      border: "border-white/25 dark:border-white/12",
      bg: "bg-white/8 dark:bg-white/5",
      glow: "from-white/12 dark:from-white/6"
    },
    strong: {
      border: "border-white/35 dark:border-white/18",
      bg: "bg-white/12 dark:bg-white/8",
      glow: "from-white/18 dark:from-white/9"
    },
  }

  const currentIntensity = intensityClasses[intensity]

  return (
    <div
      className={cn(
        // Glass morphism base
        "relative rounded-md overflow-hidden",
        // Border with glass effect
        currentIntensity.border,
        "border",
        // Backdrop blur for glass effect
        "backdrop-blur-md",
        // Subtle background for glass effect
        currentIntensity.bg,
        // Shadow for depth
        "shadow-sm",
        // Transition
        "transition-all duration-200",
        // Hover effect
        "hover:shadow-md hover:border-white/30 dark:hover:border-white/15",
        className
      )}
      {...props}
    >
      {/* Inner glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-md pointer-events-none",
          "bg-gradient-to-br",
          currentIntensity.glow,
          "to-transparent",
          "opacity-50"
        )}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export { GlassInputWrapper }
export type { GlassInputWrapperProps }

