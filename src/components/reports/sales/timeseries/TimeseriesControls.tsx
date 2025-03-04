
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeseriesControlsProps {
  currentPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metric: 'quantity' | 'revenue' | 'profit' | 'margin';
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  onMetricChange: (metric: 'quantity' | 'revenue' | 'profit' | 'margin') => void;
  periodLabel: string;
}

export const TimeseriesControls = ({ 
  currentPeriod, 
  metric, 
  onPeriodChange, 
  onMetricChange,
  periodLabel
}: TimeseriesControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between mb-6">
      <h3 className="text-lg font-medium mb-4 sm:mb-0">Penjualan {periodLabel}</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={currentPeriod} onValueChange={(value: any) => onPeriodChange?.(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Harian</SelectItem>
            <SelectItem value="weekly">Mingguan</SelectItem>
            <SelectItem value="monthly">Bulanan</SelectItem>
            <SelectItem value="yearly">Tahunan</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={metric} onValueChange={(value: any) => onMetricChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih metrik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quantity">Total Transaksi</SelectItem>
            <SelectItem value="revenue">Total Pendapatan</SelectItem>
            <SelectItem value="profit">Total Keuntungan</SelectItem>
            <SelectItem value="margin">Margin Keuntungan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
