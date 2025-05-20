
import React from 'react';
import { ChartPie, ChartLine, Thermometer, ArrowDown, Calculator } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  onCalculatorClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  activeTab,
  onTabChange,
  onCalculatorClick
}) => {
  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor battery health metrics across your fleet
          </p>
        </div>
        
        {onCalculatorClick && (
          <Button onClick={onCalculatorClick} className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span>Battery Calculator</span>
          </Button>
        )}
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartPie className="w-4 h-4" />
            <span className="sm:inline">Overview</span>
          </TabsTrigger>
          
          <TabsTrigger value="soh" className="flex items-center gap-2">
            <ChartLine className="w-4 h-4" />
            <span className="sm:inline">Health (SoH)</span>
          </TabsTrigger>
          
          <TabsTrigger value="degradation" className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4" />
            <span className="sm:inline">Degradation</span>
          </TabsTrigger>
          
          <TabsTrigger value="thermal" className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            <span className="sm:inline">Thermal</span>
          </TabsTrigger>
          
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <ChartLine className="w-4 h-4" />
            <span className="sm:inline">Comparison</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default DashboardHeader;
