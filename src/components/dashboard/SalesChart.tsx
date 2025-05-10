"use client";

import { Line, Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js";
import { useState } from 'react';
import { useTheme } from "next-themes";

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

interface SalesChartProps {
  className?: string;
}

export default function SalesChart({ className }: SalesChartProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'orders'>('revenue');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Sample data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const revenueData = [4200, 5800, 5200, 7500, 6800, 8100, 7200, 9500, 10200];
  const ordersData = [380, 420, 390, 450, 420, 480, 460, 520, 540];
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : 'white',
        titleColor: isDark ? 'white' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
        },
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          weight: '600',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(value: number) {
            return activeTab === 'revenue' 
              ? '$' + value.toLocaleString() 
              : value.toLocaleString();
          }
        },
        border: {
          dash: [4, 4],
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
  };

  // Line chart data
  const lineData = {
    labels: months,
    datasets: [
      {
        label: activeTab === 'revenue' ? 'Revenue' : 'Orders',
        data: activeTab === 'revenue' ? revenueData : ordersData,
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointBorderWidth: 2,
      },
    ],
  };
  
  // Bar chart data
  const barData = {
    labels: months,
    datasets: [
      {
        label: activeTab === 'revenue' ? 'Revenue' : 'Orders',
        data: activeTab === 'revenue' ? revenueData : ordersData,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(124, 58, 237, 0.8)'); // purple-600
          gradient.addColorStop(1, 'rgba(124, 58, 237, 0.3)');
          return gradient;
        },
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="font-semibold text-lg">Sales Analytics</h3>
          <p className="text-muted-foreground text-sm">Compare revenue and order trends</p>
        </div>
        <div className="flex mt-3 sm:mt-0 p-1 bg-muted rounded-lg">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'revenue' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'orders' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>
      </div>
      
      <div className="h-[300px]">
        <Line data={lineData} options={options as any} />
      </div>
      
      {/* Chart legend/summary */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-sm font-medium">
            {activeTab === 'revenue' ? 'Total Revenue' : 'Total Orders'}
          </span>
        </div>
        <div className="text-sm font-semibold">
          {activeTab === 'revenue' 
            ? `$${revenueData.reduce((a, b) => a + b, 0).toLocaleString()}` 
            : ordersData.reduce((a, b) => a + b, 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}