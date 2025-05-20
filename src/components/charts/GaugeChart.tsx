
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { generateGaugeGradient } from '@/utils/batteryAnalytics';

interface GaugeChartProps {
  value: number;
  label: string;
  size?: number;
  thickness?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  label,
  size = 200,
  thickness = 20,
}) => {
  // Ensure value is between 0-100
  const safeValue = Math.min(100, Math.max(0, value));
  
  // Calculate the angle for the gauge
  const startAngle = 180;
  const endAngle = 0;
  const gaugeAngle = ((100 - safeValue) / 100) * (startAngle - endAngle) + endAngle;
  
  // Gauge data
  const data = [
    { name: 'filled', value: safeValue },
    { name: 'empty', value: 100 - safeValue },
  ];
  
  const color = generateGaugeGradient(safeValue);
  
  return (
    <div style={{ width: size, height: size/1.8, margin: '0 auto' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={size/2 - thickness}
            outerRadius={size/2}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell key="filled" fill={color} />
            <Cell key="empty" fill="#e5e7eb" />
            <Label
              value={`${safeValue}%`}
              position="center"
              dy={-30}
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fill: '#374151',
              }}
            />
            <Label
              value={label}
              position="center"
              dy={0}
              style={{
                fontSize: '0.875rem',
                fill: '#6b7280',
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GaugeChart;
