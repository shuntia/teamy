'use client'

export function AnimatedGradient() {
  return (
    <>
      {/* Animated gradient orbs - similar to Zoo.dev */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orb 1 */}
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-teamy-primary/20 to-teamy-accent/20 blur-3xl animate-float" />
        
        {/* Large gradient orb 2 */}
        <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-purple-500/15 to-pink-500/15 blur-3xl animate-float-delayed" />
        
        {/* Smaller accent orbs */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-2xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 blur-2xl animate-pulse-slow-delayed" />
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />
    </>
  )
}

