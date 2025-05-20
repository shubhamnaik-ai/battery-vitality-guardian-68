
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CarFront, ChartLine, ChartBar, ChartPie, Thermometer, AlertTriangle } from 'lucide-react';
import { calculateDegradationRate } from '@/utils/batteryAnalytics';
import { getMinMaxTemperatureVehicles, getVehiclesWithThermalIssues } from '@/utils/extendedMockData';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  // State for dialogs
  const [isDepotDialogOpen, setIsDepotDialogOpen] = useState(false);
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const [isThermalDialogOpen, setIsThermalDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    description: string;
    data: any[];
    type: 'depot' | 'health' | 'thermal';
  }>({
    title: '',
    description: '',
    data: [],
    type: 'depot',
  });
  
  // Filter data based on selected depots
  const filteredData = selectedDepots.length > 0
    ? fleetData.filter(battery => selectedDepots.includes(battery.depot))
    : fleetData;

  // Calculate summary metrics
  const totalVehicles = filteredData.length;
  const averageSoH = (filteredData.reduce((acc, battery) => acc + battery.soh, 0) / totalVehicles).toFixed(1);
  const minSoH = Math.min(...filteredData.map(battery => battery.soh)).toFixed(1);
  const maxSoH = Math.max(...filteredData.map(battery => battery.soh)).toFixed(1);
  
  const averageTemperature = (filteredData.reduce((acc, battery) => acc + battery.temperature, 0) / totalVehicles).toFixed(1);
  const healthyVehicles = filteredData.filter(battery => battery.status === 'optimal' || battery.status === 'good').length;
  const warningVehicles = filteredData.filter(battery => battery.status === 'warning' || battery.status === 'critical').length;
  
  const totalCycles = filteredData.reduce((acc, battery) => acc + battery.cycleCount, 0);
  const averageCycles = (totalCycles / totalVehicles).toFixed(0);
  const minCycles = Math.min(...filteredData.map(battery => battery.cycleCount)).toFixed(0);
  const maxCycles = Math.max(...filteredData.map(battery => battery.cycleCount)).toFixed(0);
  
  const averageDegradation = calculateDegradationRate(sohHistoricalData['BAT-001']).toFixed(2);

  // Get temperature data
  const tempData = getMinMaxTemperatureVehicles(filteredData);
  const thermalIssues = getVehiclesWithThermalIssues(filteredData);

  // Depot distribution
  const depotsCount = depots.map(depot => ({
    name: depot,
    count: fleetData.filter(battery => battery.depot === depot).length
  })).sort((a, b) => b.count - a.count);

  // Handle dialog open for depot distribution
  const handleDepotClick = (depot: string) => {
    const depotVehicles = fleetData.filter(battery => battery.depot === depot);
    setDialogContent({
      title: `${depot} Vehicles`,
      description: `List of all ${depotVehicles.length} vehicles in ${depot}`,
      data: depotVehicles,
      type: 'depot',
    });
    setIsDepotDialogOpen(true);
  };

  // Handle dialog open for health distribution
  const handleHealthClick = (status: string) => {
    const statusVehicles = filteredData.filter(battery => battery.status === status);
    setDialogContent({
      title: `${status.charAt(0).toUpperCase() + status.slice(1)} Health Vehicles`,
      description: `List of all ${statusVehicles.length} vehicles with ${status} health status`,
      data: statusVehicles,
      type: 'health',
    });
    setIsHealthDialogOpen(true);
  };

  // Handle thermal issues dialog
  const handleThermalClick = () => {
    setDialogContent({
      title: 'Thermal Issue Vehicles',
      description: `List of all ${thermalIssues.length} vehicles with potential thermal issues`,
      data: thermalIssues,
      type: 'thermal',
    });
    setIsThermalDialogOpen(true);
  };

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
              Battery Health Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex justify-between">
              <span className="text-red-500">Min: {minSoH}%</span>
              <span className="text-green-500">Max: {maxSoH}%</span>
            </div>
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
              Charging Cycles Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex justify-between">
              <span className="text-green-500">Min: {minCycles}</span>
              <span className="text-red-500">Max: {maxCycles}</span>
            </div>
            <p className="text-xs text-muted-foreground">Avg: {averageCycles} cycles</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer" onClick={handleThermalClick}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Thermal Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{thermalIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              {thermalIssues.length > 0 ? (
                <span className="flex items-center text-red-500">
                  <AlertTriangle className="h-3 w-3 mr-1" /> High temperature alerts
                </span>
              ) : (
                "No thermal issues detected"
              )}
            </p>
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
                <div 
                  key={depot.name} 
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                  onClick={() => handleDepotClick(depot.name)}
                >
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
                  <div 
                    key={status} 
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => handleHealthClick(status)}
                  >
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

      {/* Depot Vehicles Dialog */}
      <Dialog open={isDepotDialogOpen} onOpenChange={setIsDepotDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Health</th>
                  <th className="p-2 text-left">Cycles</th>
                  <th className="p-2 text-left">Temperature</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {dialogContent.data.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{vehicle.id}</td>
                    <td className="p-2">{vehicle.name}</td>
                    <td className="p-2">{vehicle.soh}%</td>
                    <td className="p-2">{vehicle.cycleCount}</td>
                    <td className="p-2">{vehicle.temperature}°C</td>
                    <td className="p-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          vehicle.status === 'optimal' ? 'bg-green-100 text-green-800' : 
                          vehicle.status === 'good' ? 'bg-blue-100 text-blue-800' : 
                          vehicle.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                          vehicle.status === 'warning' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Health Status Vehicles Dialog */}
      <Dialog open={isHealthDialogOpen} onOpenChange={setIsHealthDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Health</th>
                  <th className="p-2 text-left">Cycles</th>
                  <th className="p-2 text-left">Depot</th>
                </tr>
              </thead>
              <tbody>
                {dialogContent.data.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{vehicle.id}</td>
                    <td className="p-2">{vehicle.name}</td>
                    <td className="p-2">{vehicle.soh}%</td>
                    <td className="p-2">{vehicle.cycleCount}</td>
                    <td className="p-2">{vehicle.depot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thermal Issues Dialog */}
      <Dialog open={isThermalDialogOpen} onOpenChange={setIsThermalDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Temperature</th>
                  <th className="p-2 text-left">Thermal Risk</th>
                  <th className="p-2 text-left">Health</th>
                  <th className="p-2 text-left">Depot</th>
                </tr>
              </thead>
              <tbody>
                {dialogContent.data.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{vehicle.id}</td>
                    <td className="p-2">{vehicle.name}</td>
                    <td className={`p-2 ${vehicle.temperature > 40 ? 'text-red-600 font-bold' : ''}`}>
                      {vehicle.temperature}°C
                    </td>
                    <td className="p-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          vehicle.thermalRisk === 'safe' ? 'bg-green-100 text-green-800' : 
                          vehicle.thermalRisk === 'elevated' ? 'bg-blue-100 text-blue-800' : 
                          vehicle.thermalRisk === 'caution' ? 'bg-yellow-100 text-yellow-800' : 
                          vehicle.thermalRisk === 'warning' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.thermalRisk.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2">{vehicle.soh}%</td>
                    <td className="p-2">{vehicle.depot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SummaryDashboard;
