
import React from 'react';
import { getStatusColorClass, getThermalColorClass } from '@/utils/batteryAnalytics';

interface HealthStatusBadgeProps {
  status: string;
  type?: 'health' | 'thermal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({
  status,
  type = 'health',
  size = 'md',
  className = '',
}) => {
  const colorClass = type === 'health' 
    ? getStatusColorClass(status)
    : getThermalColorClass(status);
  
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default HealthStatusBadge;
