
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChartBar, Settings, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onTabChange,
  activeTab,
}) => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Monitor and analyze battery health and performance.
        </p>
      </div>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateRange}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setDateRange('Today')}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 7 days')}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 30 days')}>
              Last 30 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 90 days')}>
              Last 90 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 12 months')}>
              Last 12 months
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Tabs 
          value={activeTab} 
          onValueChange={onTabChange}
          className="space-y-0"
        >
          <TabsList className="h-8 p-0.5">
            <TabsTrigger 
              value="overview" 
              className="text-xs px-2.5 py-1.5"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="soh" 
              className="text-xs px-2.5 py-1.5"
            >
              Health
            </TabsTrigger>
            <TabsTrigger 
              value="degradation" 
              className="text-xs px-2.5 py-1.5"
            >
              Degradation
            </TabsTrigger>
            <TabsTrigger 
              value="thermal" 
              className="text-xs px-2.5 py-1.5"
            >
              Thermal
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
