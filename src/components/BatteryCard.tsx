
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getStatusDescription } from '@/utils/batteryAnalytics';
import HealthStatusBadge from './HealthStatusBadge';
import { ChartBar, Thermometer, Activity } from 'lucide-react';

interface BatteryCardProps {
  id: string;
  name: string;
  location: string;
  status: string;
  soh: number;
  soc: number;
  temperature: number;
  thermalRisk: string;
  cycleCount: number;
  estimatedLifeRemaining: string;
  lastUpdated: string;
  onClick?: () => void;
}

export const BatteryCard: React.FC<BatteryCardProps> = ({
  id,
  name,
  location,
  status,
  soh,
  soc,
  temperature,
  thermalRisk,
  cycleCount,
  estimatedLifeRemaining,
  lastUpdated,
  onClick,
}) => {
  return (
    <Card 
      className="transition-shadow hover:shadow-md cursor-pointer h-full"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{location} • ID: {id}</CardDescription>
          </div>
          <HealthStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col">
            <div className="flex items-center text-muted-foreground mb-1 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              <span>Health</span>
            </div>
            <div className="text-lg font-semibold">{soh}%</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              ~{estimatedLifeRemaining} left
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center text-muted-foreground mb-1 text-xs">
              <ChartBar className="h-3 w-3 mr-1" />
              <span>Charge</span>
            </div>
            <div className="text-lg font-semibold">{soc}%</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {cycleCount} cycles
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t pt-2 mt-1">
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-1 text-gray-400" />
            <span className="text-sm">{temperature}°C</span>
            <HealthStatusBadge 
              status={thermalRisk} 
              type="thermal" 
              size="sm" 
              className="ml-2"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {formatDate(lastUpdated)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatteryCard;
