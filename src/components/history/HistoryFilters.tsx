
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Branch {
  cabang_id: number;
  branch_name: string;
}

interface HistoryFiltersProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  selectedBranchId: number | undefined;
  onBranchChange: (branchId: number | undefined) => void;
  branches: Branch[];
}

export const HistoryFilters = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedBranchId,
  onBranchChange,
  branches
}: HistoryFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Periode:</span>
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 py-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd MMM yyyy', { locale: id }) : 'Tanggal Awal'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                initialFocus
                locale={id}
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs">-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 py-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd MMM yyyy', { locale: id }) : 'Tanggal Akhir'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                initialFocus
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Cabang:</span>
        <Select 
          value={selectedBranchId?.toString()} 
          onValueChange={(value) => onBranchChange(value === "all" ? undefined : Number(value))}
        >
          <SelectTrigger className="w-full md:w-[180px] h-9">
            <SelectValue placeholder="Semua Cabang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Cabang</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.cabang_id} value={branch.cabang_id.toString()}>
                {branch.branch_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        className="h-9 px-3 py-1"
        onClick={() => {
          onStartDateChange(undefined);
          onEndDateChange(undefined);
          onBranchChange(undefined);
        }}
      >
        Reset Filter
      </Button>
    </div>
  );
};
