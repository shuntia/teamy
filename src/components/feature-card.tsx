'use client'

import { LucideIcon } from 'lucide-react'
import { useState } from 'react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  color: string
  delay?: number
}

export function FeatureCard({ icon: Icon, title, description, color, delay = 0 }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border gradient */}
      <div className={`absolute -inset-[1px] bg-gradient-to-br ${color} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500`} />
      
      {/* Card content */}
      <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-full">
        {/* Icon container with gradient background */}
        <div className={`relative w-12 h-12 rounded-xl mb-4 transition-all duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 rounded-xl`} />
          <div className="relative w-full h-full flex items-center justify-center">
            <Icon className={`h-6 w-6 bg-gradient-to-br ${color} bg-clip-text text-transparent transition-all duration-300`} style={{ filter: isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'none' }} />
          </div>
        </div>

        {/* Text content */}
        <h3 className="font-heading text-base font-semibold mb-2 text-foreground group-hover:text-teamy-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Hover glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500 pointer-events-none`} />
      </div>
    </div>
  )
}

