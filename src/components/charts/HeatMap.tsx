
import React from 'react';
import { getHeatClass } from '@/utils/batteryAnalytics';

interface HeatMapProps {
  data: number[][];
  cellSize?: number;
  showValues?: boolean;
  title?: string;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  cellSize = 40,
  showValues = true,
  title,
}) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No thermal data available</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <div className="border border-gray-200 rounded overflow-hidden">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((value, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className={`${getHeatClass(value)} flex items-center justify-center`}
                style={{ width: cellSize, height: cellSize }}
              >
                {showValues && (
                  <span className="text-xs font-medium text-gray-800">
                    {value.toFixed(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center mt-2 text-xs">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-blue-100 inline-block"></span>
          <span>&lt;25°C</span>
        </div>
        <span className="mx-1">→</span>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-red-500 inline-block"></span>
          <span>&gt;45°C</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
