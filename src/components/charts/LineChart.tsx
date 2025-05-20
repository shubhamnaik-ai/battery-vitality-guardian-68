
import React, { useState, useEffect } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, Label } from 'recharts';
import { ZoomIn, ZoomOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

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
  xAxisFormatter?: (value: any) => string;
  additionalLines?: {
    dataKey: string;
    color: string;
    label?: string;
  }[];
  yAxisLabel?: string;
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
  xAxisFormatter = (value) => String(value),
  additionalLines = [],
  yAxisLabel,
}) => {
  const [leftZoom, setLeftZoom] = useState<number | null>(null);
  const [rightZoom, setRightZoom] = useState<number | null>(null);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [zoomedData, setZoomedData] = useState(data);
  const [isRefAreaShown, setIsRefAreaShown] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    setZoomedData(data);
  }, [data]);

  useEffect(() => {
    if (dateRange.from && dateRange.to && xDataKey === 'timestamp') {
      const fromTime = dateRange.from.getTime();
      const toTime = dateRange.to.getTime();
      
      const filteredData = data.filter(item => {
        if (item.timestamp) {
          const itemDate = new Date(item.timestamp).getTime();
          return itemDate >= fromTime && itemDate <= toTime;
        }
        return false;
      });
      
      setZoomedData(filteredData.length > 0 ? filteredData : data);
    }
  }, [dateRange, data, xDataKey]);

  const handleZoomIn = () => {
    setIsZoomEnabled(true);
  };

  const handleZoomOut = () => {
    setIsZoomEnabled(false);
    setZoomedData(data);
    setDateRange({ from: undefined, to: undefined });
  };

  const handleMouseDown = (e: any) => {
    if (!isZoomEnabled || !e) return;
    setIsRefAreaShown(true);
    setLeftZoom(e.activeLabel);
  };

  const handleMouseMove = (e: any) => {
    if (!isZoomEnabled || !leftZoom || !e) return;
    setRightZoom(e.activeLabel);
  };

  const handleMouseUp = () => {
    if (!isZoomEnabled || !leftZoom || !rightZoom) {
      setIsRefAreaShown(false);
      setLeftZoom(null);
      setRightZoom(null);
      return;
    }

    // Ensure we're working with indices, not labels
    let left = data.findIndex(item => item[xDataKey] === leftZoom);
    let right = data.findIndex(item => item[xDataKey] === rightZoom);

    // Make sure left is smaller than right
    if (left > right) [left, right] = [right, left];

    if (left === right || right === -1) {
      setIsRefAreaShown(false);
      setLeftZoom(null);
      setRightZoom(null);
      return;
    }

    // Apply zoom
    const newData = data.slice(left, right + 1);
    setZoomedData(newData);

    // Reset the selection area
    setIsRefAreaShown(false);
    setLeftZoom(null);
    setRightZoom(null);
  };

  // Ensure xAxisFormatter handles all types of values
  const safeXAxisFormatter = (value: any) => {
    try {
      if (typeof value === 'string' || value instanceof String) {
        return xAxisFormatter(value);
      } else {
        return String(value);
      }
    } catch (error) {
      console.error('Error formatting x-axis value:', error, value);
      return String(value);
    }
  };

  return (
    <div className="relative" style={{ width: '100%', height }}>
      <div className="absolute top-0 right-0 flex gap-2 z-10">
        {xDataKey === 'timestamp' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="p-3">
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to || range?.from,
                    });
                  }}
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
                <div className="flex justify-between mt-2">
                  <div className="text-xs">
                    {dateRange.from ? (
                      <span>From: {format(dateRange.from, 'PPP')}</span>
                    ) : (
                      <span>Select start date</span>
                    )}
                  </div>
                  <div className="text-xs">
                    {dateRange.to ? (
                      <span>To: {format(dateRange.to, 'PPP')}</span>
                    ) : (
                      <span>Select end date</span>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleZoomIn}
          disabled={isZoomEnabled}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleZoomOut}
          disabled={!isZoomEnabled && !dateRange.from}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      <ResponsiveContainer>
        <RechartsLineChart
          data={zoomedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey={xDataKey} 
            tickFormatter={safeXAxisFormatter}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            style={{ fontSize: '12px' }}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '12px' } 
            } : undefined}
          />
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
          {isRefAreaShown && leftZoom && rightZoom && (
            <ReferenceArea x1={leftZoom} x2={rightZoom} stroke="#8884d8" strokeOpacity={0.3} fill="#8884d8" fillOpacity={0.3} />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
