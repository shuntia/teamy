import { cn } from "@/lib/utils"

export type LoadingSpinnerVariant = "spinner" | "dots" | "pulse" | "bars" | "ring" | "orbit"
export type LoadingSpinnerSize = "xs" | "sm" | "md" | "lg" | "xl"

interface LoadingSpinnerProps {
  variant?: LoadingSpinnerVariant
  size?: LoadingSpinnerSize
  className?: string
  label?: string
}

// Animation constants
const EASING = "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
const EASING_PULSE = "cubic-bezier(0.4, 0, 0.6, 1)"
const EASING_PING = "cubic-bezier(0, 0, 0.2, 1)"

// Size configurations
const SIZES = {
  xs: { container: "w-3 h-3", dot: "w-1.5 h-1.5", bar: "w-0.5 h-3" },
  sm: { container: "w-4 h-4", dot: "w-2 h-2", bar: "w-0.5 h-4" },
  md: { container: "w-6 h-6", dot: "w-2.5 h-2.5", bar: "w-1 h-5" },
  lg: { container: "w-10 h-10", dot: "w-3.5 h-3.5", bar: "w-1.5 h-7" },
  xl: { container: "w-16 h-16", dot: "w-5 h-5", bar: "w-2 h-10" },
} as const

// Helper: Animated dots component
function AnimatedDots({
  count,
  size,
  delayMultiplier = 0.2,
  animationType = "bounce",
  className,
}: {
  count: number
  size: LoadingSpinnerSize
  delayMultiplier?: number
  animationType?: "bounce" | "pulse"
  className?: string
}) {
  const duration = animationType === "bounce" ? "1.4s" : "1.5s"
  const easing = animationType === "bounce" ? EASING : EASING_PULSE
  const sizeClass = animationType === "pulse" ? "w-1.5 h-1.5" : SIZES[size].dot

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-primary shadow-md",
            sizeClass,
            animationType === "pulse" && "bg-primary/50",
            className
          )}
          style={{
            animation: `${animationType} ${duration} ${easing} infinite`,
            animationDelay: `${i * delayMultiplier}s`,
          }}
        />
      ))}
    </>
  )
}

export function LoadingSpinner({
  variant = "spinner",
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClass = SIZES[size].container

  const renderSpinner = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className={cn("relative", sizeClass, className)}>
            <svg
              className="animate-spin text-primary"
              style={{ animation: `spin 1s ${EASING} infinite` }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )

      case "dots":
        return (
          <div className={cn("flex items-center gap-2", className)}>
            <AnimatedDots count={3} size={size} delayMultiplier={0.16} />
          </div>
        )

      case "pulse":
        return (
          <div className={cn("relative", sizeClass, className)}>
            <div
              className="absolute inset-0 rounded-full bg-primary/40"
              style={{ animation: `ping 2s ${EASING_PING} infinite` }}
            />
            <div
              className="absolute inset-0 rounded-full bg-primary shadow-lg"
              style={{ animation: `pulse 2s ${EASING_PULSE} infinite` }}
            />
            <div className="absolute inset-2 rounded-full bg-primary/80" />
          </div>
        )

      case "bars":
        return (
          <div className={cn("flex items-end gap-1.5", className)}>
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={cn("bg-primary rounded-sm shadow-md", SIZES[size].bar)}
                style={{
                  animation: `barWave 1.2s ${EASING} infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )

      case "ring":
        return (
          <div
            className={cn("relative rounded-full border-4 border-primary/10", sizeClass, className)}
            style={{ animation: `spin 1s ${EASING} infinite` }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/70" />
          </div>
        )

      case "orbit":
        return (
          <div className={cn("relative", sizeClass, className)}>
            <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
              style={{ animation: `spin 1s ${EASING} infinite` }}
            />
            <div
              className="absolute inset-1 rounded-full border-2 border-transparent border-b-primary/70"
              style={{ animation: `spin 1.5s ${EASING} infinite reverse` }}
            />
            <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg" />
          </div>
        )

      default:
        return null
    }
  }

  if (label) {
    return (
      <div className="flex flex-col items-center gap-3">
        {renderSpinner()}
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      </div>
    )
  }

  return renderSpinner()
}

// Fullscreen loading overlay
interface LoadingOverlayProps {
  message?: string
  variant?: LoadingSpinnerVariant
}

export function LoadingOverlay({ message = "Loading...", variant = "orbit" }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-6 p-10 rounded-3xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border border-border/60 shadow-2xl">
        <div className="absolute inset-0 rounded-3xl bg-primary/5 pointer-events-none" />
        <div className="relative">
          <LoadingSpinner variant={variant} size="xl" />
        </div>
        <div className="relative text-center">
          <p className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

// Button loading spinner
interface ButtonLoadingProps {
  className?: string
  size?: LoadingSpinnerSize
}

export function ButtonLoading({ className, size = "sm" }: ButtonLoadingProps) {
  return <LoadingSpinner variant="spinner" size={size} className={cn("mr-2", className)} />
}

// Inline loading text with spinner
interface LoadingTextProps {
  text?: string
  variant?: LoadingSpinnerVariant
  size?: LoadingSpinnerSize
  className?: string
}

export function LoadingText({
  text = "Loading...",
  variant = "dots",
  size = "sm",
  className,
}: LoadingTextProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LoadingSpinner variant={variant} size={size} />
      <span className="text-sm font-medium text-muted-foreground animate-pulse">{text}</span>
    </div>
  )
}

// Page loading skeleton
interface PageLoadingProps {
  title?: string
  description?: string
  variant?: LoadingSpinnerVariant
}

export function PageLoading({
  title = "Loading content",
  description,
  variant = "orbit",
}: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 py-16">
      <div className="relative">
        <div
          className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150"
          style={{ animation: `pulse 2s ${EASING_PULSE} infinite` }}
        />
        <div className="relative">
          <LoadingSpinner variant={variant} size="lg" />
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md px-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed animate-pulse">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
