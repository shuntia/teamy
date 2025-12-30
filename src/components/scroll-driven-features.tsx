'use client'

import { useEffect, useRef, useState } from 'react'
import { 
  MessageSquare, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  BarChart3, 
  FolderKanban, 
  DollarSign, 
  Wrench 
} from 'lucide-react'

const iconMap = {
  MessageSquare,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart3,
  FolderKanban,
  DollarSign,
  Wrench,
}

interface Feature {
  icon: keyof typeof iconMap
  title: string
  description: string
}

interface ScrollDrivenFeaturesProps {
  features: Feature[]
}

export function ScrollDrivenFeatures({ features }: ScrollDrivenFeaturesProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [minHeight, setMinHeight] = useState(`${features.length * 30}vh`)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Adjust min-height for mobile
    const updateMinHeight = () => {
      if (window.innerWidth < 640) {
        setMinHeight(`${features.length * 25}vh`)
      } else {
        setMinHeight(`${features.length * 30}vh`)
      }
    }
    
    updateMinHeight()
    window.addEventListener('resize', updateMinHeight)
    
    return () => window.removeEventListener('resize', updateMinHeight)
  }, [features.length])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      const scrollProgress = Math.max(0, -rect.top) / (container.offsetHeight - window.innerHeight)
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
      const index = Math.min(
        Math.floor(clampedProgress * features.length),
        features.length - 1
      )
      
      setActiveIndex(Math.max(0, index))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [features.length])

  return (
    <div ref={containerRef} className="relative pb-2" style={{ minHeight }}>
      <div className="sticky top-16 sm:top-20 h-[85vh] sm:h-[75vh] lg:h-[70vh] flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col justify-center min-h-0">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8 flex-shrink-0">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 sm:mb-4">
              Features
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Everything you need to manage your Science Olympiad team
            </p>
          </div>
          
          {/* Feature showcase */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-center flex-shrink-0">
            {/* Left: Feature List (Static - All visible) */}
            <div className="w-full lg:w-auto space-y-2 sm:space-y-3 order-2 lg:order-1">
              {features.map((feature, index) => {
                const isActive = index === activeIndex

                return (
                  <div
                    key={feature.title}
                    className={`transition-all duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <h3
                      className={`font-heading text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-500 ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {feature.title}
                    </h3>
                  </div>
                )
              })}
            </div>

            {/* Right: Scroll-driven stacked images */}
            <div className="w-full lg:w-auto h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] mt-0 lg:mt-8 order-1 lg:order-2">
              <div className="relative h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card dark:bg-slate-800 border-2 border-border shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-center">
                {features.map((feature, index) => {
                  const Icon = iconMap[feature.icon]
                  const isActive = index === activeIndex

                  return (
                    <div
                      key={feature.title}
                      className={`absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-700 ${
                        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}
                    >
                      <div className="relative mb-4 sm:mb-6 w-full">
                        {/* Large icon - wider and shorter */}
                        <div
                          className={`w-full h-24 sm:h-32 md:h-36 lg:h-44 rounded-2xl sm:rounded-3xl bg-teamy-primary/10 dark:bg-teamy-primary/20 flex items-center justify-center shadow-2xl animate-float`}
                        >
                          <Icon className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-teamy-primary" strokeWidth={1.5} />
                        </div>
                        {/* Decorative rings */}
                        <div
                          className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-4 border-teamy-primary/20 animate-pulse-slow`}
                          style={{ animationDelay: '0s' }}
                        />
                        <div
                          className={`absolute -inset-2 rounded-2xl sm:rounded-3xl border-2 border-teamy-primary/10 animate-pulse-slow`}
                          style={{ animationDelay: '0.5s' }}
                        />
                      </div>
                      
                      {/* Description */}
                      <div className="text-center max-w-md px-2">
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
