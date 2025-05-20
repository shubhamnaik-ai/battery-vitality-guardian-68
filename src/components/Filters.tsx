
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface FiltersProps {
  depots: string[];
  vehicles: string[];
  selectedDepots: string[];
  selectedVehicles: string[];
  onDepotFilterChange: (depots: string[]) => void;
  onVehicleFilterChange: (vehicles: string[]) => void;
}

const Filters: React.FC<FiltersProps> = ({
  depots,
  vehicles,
  selectedDepots,
  selectedVehicles,
  onDepotFilterChange,
  onVehicleFilterChange,
}) => {
  // Check if all depots are selected
  const allDepotsSelected = selectedDepots.length === depots.length;
  
  // Check if all vehicles are selected
  const allVehiclesSelected = selectedVehicles.length === vehicles.length;

  // Handle select all depots
  const handleSelectAllDepots = () => {
    if (allDepotsSelected) {
      onDepotFilterChange([]);
    } else {
      onDepotFilterChange([...depots]);
    }
  };

  // Handle select all vehicles
  const handleSelectAllVehicles = () => {
    if (allVehiclesSelected) {
      onVehicleFilterChange([]);
    } else {
      onVehicleFilterChange([...vehicles]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Depot</span>
            {selectedDepots.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[11px] flex items-center justify-center text-primary-foreground">
                {selectedDepots.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuCheckboxItem
            checked={allDepotsSelected}
            onCheckedChange={handleSelectAllDepots}
            className="font-semibold"
          >
            Select All
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {depots.map((depot) => (
            <DropdownMenuCheckboxItem
              key={depot}
              checked={selectedDepots.includes(depot)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onDepotFilterChange([...selectedDepots, depot]);
                } else {
                  onDepotFilterChange(selectedDepots.filter(d => d !== depot));
                }
              }}
            >
              {depot}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Vehicle</span>
            {selectedVehicles.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[11px] flex items-center justify-center text-primary-foreground">
                {selectedVehicles.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-[400px] overflow-auto">
          <DropdownMenuCheckboxItem
            checked={allVehiclesSelected}
            onCheckedChange={handleSelectAllVehicles}
            className="font-semibold sticky top-0 bg-background z-10"
          >
            Select All
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {vehicles.map((vehicle) => (
            <DropdownMenuCheckboxItem
              key={vehicle}
              checked={selectedVehicles.includes(vehicle)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onVehicleFilterChange([...selectedVehicles, vehicle]);
                } else {
                  onVehicleFilterChange(selectedVehicles.filter(v => v !== vehicle));
                }
              }}
            >
              {vehicle}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Filters;
