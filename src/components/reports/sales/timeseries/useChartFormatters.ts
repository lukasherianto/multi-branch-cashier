
import { useMemo } from 'react';

export const useChartFormatters = (metric: 'quantity' | 'revenue' | 'profit' | 'margin') => {
  const getYAxisLabel = () => {
    switch (metric) {
      case 'quantity':
        return 'Jumlah';
      case 'revenue':
        return 'Pendapatan (Rp)';
      case 'profit':
        return 'Keuntungan (Rp)';
      case 'margin':
        return 'Margin (%)';
      default:
        return '';
    }
  };

  const formatTooltipValue = (value: number) => {
    if (metric === 'quantity') {
      return `${value.toFixed(0)}`;
    } else if (metric === 'margin') {
      return `${value.toFixed(2)}%`;
    } else {
      return `Rp ${value.toLocaleString('id-ID')}`;
    }
  };

  const formatYAxis = (value: number) => {
    if (metric === 'quantity') {
      return value.toFixed(0);
    } else if (metric === 'margin') {
      return `${value.toFixed(0)}%`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const getChartColor = () => {
    switch (metric) {
      case 'quantity':
        return '#3b82f6'; // blue
      case 'revenue':
        return '#10b981'; // green
      case 'profit':
        return '#f59e0b'; // amber
      case 'margin':
        return '#8b5cf6'; // purple
      default:
        return '#3b82f6';
    }
  };

  return { getYAxisLabel, formatTooltipValue, formatYAxis, getChartColor };
};
