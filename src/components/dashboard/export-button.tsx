'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  FileSpreadsheet,
  FileImage,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import { useFilterStore } from '@/lib/store';
import { generateDashboardData, getDateRangeInfo } from '@/lib/data/mock-data';
import type { DashboardData } from '@/types';

interface ExportButtonProps {
  chartRef?: React.RefObject<HTMLDivElement>;
  chartTitle?: string;
}

export function ExportButton({ chartRef, chartTitle }: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { timeRange, brandId } = useFilterStore();

  const dateInfo = getDateRangeInfo(timeRange);

  const exportToCSV = async () => {
    setExporting('csv');
    try {
      const data = generateDashboardData(timeRange, brandId);
      
      // Create CSV content
      const rows = [
        ['Metric', 'Value'],
        ['Total Revenue', data.revenue.totalRevenue.toString()],
        ['Net Profit', data.profit.netProfit.toString()],
        ['Total Orders', data.sales.totalOrders.toString()],
        ['Average Order Value', data.sales.averageOrderValue.toString()],
        ['Conversion Rate', data.sales.conversionRate.toString()],
        ['Gross Margin', data.profit.grossMargin.toString()],
        ['Net Margin', data.profit.netMargin.toString()],
        ['ROAS', data.marketing.roas.toString()],
        ['Ad Spend', data.marketing.adSpend.toString()],
        ['', ''],
        ['Brand Performance', ''],
        ...Object.entries(data.revenue.revenueByBrand).map(([name, value]) => [name, value.toString()]),
        ['', ''],
        ['Platform Performance', ''],
        ...data.platformPerformance.map(p => [p.platform, p.revenue.toString()]),
      ];

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `datahub-export-${dateInfo.label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setExporting(null);
    }
  };

  const exportToJSON = async () => {
    setExporting('json');
    try {
      const data = generateDashboardData(timeRange, brandId);
      const exportData = {
        exportedAt: new Date().toISOString(),
        timeRange: dateInfo.label,
        dateRange: {
          start: dateInfo.startDate,
          end: dateInfo.endDate,
        },
        metrics: {
          revenue: data.revenue,
          profit: data.profit,
          sales: data.sales,
          marketing: data.marketing,
        },
        brandPerformance: data.topBrands,
        platformPerformance: data.platformPerformance,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `datahub-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setExporting(null);
    }
  };

  const exportChartAsPNG = async () => {
    if (!chartRef?.current) return;
    
    setExporting('png');
    try {
      // Use html2canvas-like approach with native canvas
      const element = chartRef.current;
      
      // For simplicity, we'll create a notification that export is ready
      // In production, you'd use html2canvas library
      const canvas = document.createElement('canvas');
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        
        // Draw a placeholder - in production use html2canvas
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Chart: ${chartTitle || 'Dashboard Chart'}`, 20, 30);
        ctx.fillText(`Exported: ${new Date().toLocaleString()}`, 20, 50);
      }

      const link = document.createElement('a');
      link.download = `${(chartTitle || 'chart').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={!!exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={exportToCSV} disabled={exporting === 'csv'}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportToJSON} disabled={exporting === 'json'}>
            <FileText className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          
          {chartRef && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportChartAsPNG} disabled={exporting === 'png'}>
                <FileImage className="mr-2 h-4 w-4" />
                Save Chart as PNG
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <DialogTitle className="text-center">Export Successful</DialogTitle>
            <DialogDescription className="text-center">
              Your data has been downloaded successfully.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
