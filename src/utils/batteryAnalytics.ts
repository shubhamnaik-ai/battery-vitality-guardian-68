
/**
 * Utility functions for battery analytics
 */

// Get the appropriate color class for the battery status
export const getStatusColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'optimal':
      return 'bg-battery-optimal text-white';
    case 'good':
      return 'bg-battery-good text-white';
    case 'moderate':
      return 'bg-battery-moderate text-white';
    case 'warning':
      return 'bg-battery-warning text-white';
    case 'critical':
      return 'bg-battery-critical text-white';
    default:
      return 'bg-battery-unknown text-white';
  }
};

// Get the appropriate color class for thermal risk
export const getThermalColorClass = (risk: string): string => {
  switch (risk.toLowerCase()) {
    case 'safe':
      return 'bg-thermal-safe text-white';
    case 'elevated':
      return 'bg-thermal-elevated text-white';
    case 'caution':
      return 'bg-thermal-caution text-white';
    case 'warning':
      return 'bg-thermal-warning text-white';
    case 'danger':
      return 'bg-thermal-danger text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get status description
export const getStatusDescription = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'optimal':
      return 'Battery is in optimal condition';
    case 'good':
      return 'Battery is in good condition with minimal degradation';
    case 'moderate':
      return 'Battery shows moderate degradation but is functioning normally';
    case 'warning':
      return 'Battery health is declining, monitoring recommended';
    case 'critical':
      return 'Battery health is critical, replacement recommended';
    default:
      return 'Battery status unknown';
  }
};

// Calculate remaining useful life in human-readable format
export const calculateRemainingLife = (soh: number): string => {
  // This is a simplified calculation for demo purposes
  // In a real application, this would be based on a more complex model
  if (soh > 95) return '4+ years';
  if (soh > 90) return '3-4 years';
  if (soh > 80) return '2-3 years';
  if (soh > 70) return '1-2 years';
  if (soh > 60) return '6-12 months';
  return '< 6 months';
};

// Calculate degradation rate (% per month)
export const calculateDegradationRate = (
  historicalData: { timestamp: string; value: number }[]
): number => {
  if (historicalData.length < 2) return 0;
  
  const first = historicalData[0];
  const last = historicalData[historicalData.length - 1];
  
  const firstDate = new Date(first.timestamp);
  const lastDate = new Date(last.timestamp);
  
  // Calculate months between dates
  const months = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                (lastDate.getMonth() - firstDate.getMonth());
  
  if (months === 0) return 0;
  
  // Calculate monthly degradation rate
  const totalDegradation = first.value - last.value;
  return totalDegradation / months;
};

// Get heat level class for thermal map
export const getHeatClass = (temperature: number): string => {
  if (temperature < 25) return 'bg-blue-100';
  if (temperature < 30) return 'bg-green-200';
  if (temperature < 35) return 'bg-green-400';
  if (temperature < 40) return 'bg-yellow-300';
  if (temperature < 45) return 'bg-orange-400';
  return 'bg-red-500';
};

// Generate color gradient for gauge chart
export const generateGaugeGradient = (value: number): string => {
  if (value > 80) return '#22c55e'; // Green
  if (value > 60) return '#84cc16'; // Light green
  if (value > 40) return '#eab308'; // Yellow
  if (value > 20) return '#f97316'; // Orange
  return '#ef4444'; // Red
};
