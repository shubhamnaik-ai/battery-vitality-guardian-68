
import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  timestamp?: string;
  cycles?: number;
  value?: number;
  capacity?: number;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  xDataKey: string;
  yDataKey: string;
  color?: string;
  label?: string;
  height?: number;
  showGrid?: boolean;
  tooltipFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  additionalLines?: {
    dataKey: string;
    color: string;
    label?: string;
  }[];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xDataKey,
  yDataKey,
  color = '#3b82f6',
  label,
  height = 300,
  showGrid = true,
  tooltipFormatter = (value) => `${value}`,
  xAxisFormatter = (value) => value,
  additionalLines = [],
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey={xDataKey} 
            tickFormatter={xAxisFormatter}
            style={{ fontSize: '12px' }}
          />
          <YAxis style={{ fontSize: '12px' }} />
          <Tooltip 
            formatter={(value) => tooltipFormatter(value as number)}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {(label || additionalLines.length > 0) && (
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          )}
          <Line
            type="monotone"
            dataKey={yDataKey}
            stroke={color}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            name={label || yDataKey}
            dot={{ r: 3 }}
          />
          {additionalLines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              name={line.label || line.dataKey}
              dot={{ r: 3 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
