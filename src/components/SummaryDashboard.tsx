
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CarFront, ChartLine, ChartBar, ChartPie } from 'lucide-react';
import { calculateDegradationRate } from '@/utils/batteryAnalytics';

interface SummaryDashboardProps {
  fleetData: any[];
  sohHistoricalData: any;
  depots: string[];
  selectedDepots: string[];
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  fleetData,
  sohHistoricalData,
  depots,
  selectedDepots
}) => {
  // Filter data based on selected depots
  const filteredData = selectedDepots.length > 0
    ? fleetData.filter(battery => selectedDepots.includes(battery.depot))
    : fleetData;

  // Calculate summary metrics
  const totalVehicles = filteredData.length;
  const averageSoH = (filteredData.reduce((acc, battery) => acc + battery.soh, 0) / totalVehicles).toFixed(1);
  const averageTemperature = (filteredData.reduce((acc, battery) => acc + battery.temperature, 0) / totalVehicles).toFixed(1);
  const healthyVehicles = filteredData.filter(battery => battery.status === 'optimal' || battery.status === 'good').length;
  const warningVehicles = filteredData.filter(battery => battery.status === 'warning' || battery.status === 'critical').length;
  const totalCycles = filteredData.reduce((acc, battery) => acc + battery.cycleCount, 0);
  const averageCycles = (totalCycles / totalVehicles).toFixed(0);
  const averageDegradation = calculateDegradationRate(sohHistoricalData['BAT-001']).toFixed(2);

  // Depot distribution
  const depotsCount = depots.map(depot => ({
    name: depot,
    count: fleetData.filter(battery => battery.depot === depot).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Fleet Summary Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CarFront className="h-4 w-4" /> 
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Across {selectedDepots.length || depots.length} depot{(selectedDepots.length || depots.length) !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ChartLine className="h-4 w-4" />
              Average Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageSoH}%</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Healthy: {healthyVehicles}</span>
              <span className="text-xs text-red-500">Warnings: {warningVehicles}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ChartBar className="h-4 w-4" />
              Average Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageCycles}</div>
            <p className="text-xs text-muted-foreground">Total: {totalCycles.toLocaleString()} cycles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ChartPie className="h-4 w-4" />
              Avg. Degradation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{averageDegradation}%</div>
            <p className="text-xs text-muted-foreground">Monthly average loss</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Depot Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {depotsCount.map((depot) => (
                <div key={depot.name} className="flex items-center">
                  <div className="flex items-center gap-2 w-32">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{depot.name}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(depot.count / totalVehicles) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{depot.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Battery Health Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['optimal', 'good', 'moderate', 'warning', 'critical'].map((status) => {
                const count = filteredData.filter(battery => battery.status === status).length;
                const percentage = totalVehicles > 0 ? (count / totalVehicles) * 100 : 0;
                
                return (
                  <div key={status} className="flex items-center">
                    <div className="w-32">
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            status === 'optimal' ? 'bg-battery-optimal' : 
                            status === 'good' ? 'bg-battery-good' : 
                            status === 'moderate' ? 'bg-battery-moderate' : 
                            status === 'warning' ? 'bg-battery-warning' : 
                            'bg-battery-critical'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{count} ({percentage.toFixed(1)}%)</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryDashboard;
