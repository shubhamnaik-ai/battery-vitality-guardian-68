
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  title: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onTabChange,
  activeTab,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      
      <div className="flex gap-4 items-center">
        <Link to="/calculator">
          <Button variant="outline" className="gap-2">
            <Calculator className="h-4 w-4" />
            <span>Battery Calculator</span>
          </Button>
        </Link>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="soh">SoH Analysis</TabsTrigger>
            <TabsTrigger value="degradation">Degradation</TabsTrigger>
            <TabsTrigger value="thermal">Thermal</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardHeader;
