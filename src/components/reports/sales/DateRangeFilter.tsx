
import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateRangeFilterProps {
  onFilterChange: (range: { 
    start: Date | undefined; 
    end: Date | undefined; 
    period: 'daily' | 'monthly' | 'yearly' | 'custom';
  }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('monthly');

  const handlePeriodChange = (value: 'daily' | 'monthly' | 'yearly' | 'custom') => {
    setPeriod(value);
    
    const today = new Date();
    let start: Date | undefined;
    let end: Date = today;
    
    switch (value) {
      case 'daily':
        // For daily, set both start and end to today
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(new Date().setHours(23, 59, 59, 999));
        break;
      case 'monthly':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'yearly':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'custom':
        // Keep current selection if any, otherwise set undefined
        start = startDate;
        end = endDate || today;
        break;
    }
    
    setStartDate(start);
    setEndDate(end);
    
    onFilterChange({ start, end, period: value });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && period !== 'custom') {
      setPeriod('custom');
    }
    onFilterChange({ start: date, end: endDate, period: 'custom' });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date && period !== 'custom') {
      setPeriod('custom');
    }
    onFilterChange({ start: startDate, end: date, period: 'custom' });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
      <div className="flex-1">
        <Select value={period} onValueChange={(value: any) => handlePeriodChange(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Harian</SelectItem>
            <SelectItem value="monthly">Bulanan</SelectItem>
            <SelectItem value="yearly">Tahunan</SelectItem>
            <SelectItem value="custom">Kustom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {period === 'custom' && (
        <div className="flex flex-1 space-x-2">
          <div className="w-1/2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd MMM yyyy', { locale: id }) : 'Tanggal Mulai'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  locale={id}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="w-1/2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd MMM yyyy', { locale: id }) : 'Tanggal Akhir'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  locale={id}
                  disabled={date => !startDate || date < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
