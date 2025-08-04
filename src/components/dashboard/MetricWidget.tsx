import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui'

// ==========================================
// TIPOS DEL COMPONENTE
// ==========================================
interface MetricWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  progress?: {
    value: number
    max: number
    color?: string
  }
  onClick?: () => void
}

// ==========================================
// COMPONENTE METRIC WIDGET
// ==========================================
export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  progress,
  onClick
}) => {
  const isClickable = !!onClick

  return (
    <Card 
      className={`${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">
          {value}
        </div>
        
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="flex items-center mt-2 text-xs">
            <span className={`${
              trend.isPositive !== false ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive !== false ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="ml-1 text-gray-600">{trend.label}</span>
          </div>
        )}

        {progress && (
          <div className="mt-2">
            <div className="flex items-center text-xs mb-1">
              <span className="text-gray-600">
                {Math.round((progress.value / progress.max) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress.color || 'bg-blue-600'
                }`}
                style={{ 
                  width: `${Math.min((progress.value / progress.max) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricWidget
