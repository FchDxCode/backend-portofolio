"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTheme } from "next-themes";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface VisitorAnalyticsProps {
  className?: string;
}

export default function VisitorAnalytics({ className }: VisitorAnalyticsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Traffic sources data
  const trafficData = {
    labels: ['Organic Search', 'Direct', 'Social Media', 'Referrals', 'Email'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgb(59, 130, 246)', // blue-500
          'rgb(168, 85, 247)', // purple-500
          'rgb(236, 72, 153)', // pink-500
          'rgb(245, 158, 11)', // amber-500
          'rgb(16, 185, 129)', // emerald-500
        ],
        borderColor: isDark ? '#1f2937' : 'white',
        borderWidth: 2,
        hoverOffset: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  // Traffic sources list
  const trafficSources = [
    { name: 'Organic Search', value: '35%', color: 'bg-blue-500' },
    { name: 'Direct', value: '25%', color: 'bg-purple-500' },
    { name: 'Social Media', value: '20%', color: 'bg-pink-500' },
    { name: 'Referrals', value: '15%', color: 'bg-amber-500' },
    { name: 'Email', value: '5%', color: 'bg-emerald-500' },
  ];

  // Current visitors data
  const currentVisitors = {
    total: 843,
    percentChange: 12.4,
    locations: [
      { country: 'United States', visitors: 324, percent: 38 },
      { country: 'United Kingdom', visitors: 158, percent: 19 },
      { country: 'Germany', visitors: 132, percent: 16 },
      { country: 'India', visitors: 86, percent: 10 },
      { country: 'Others', visitors: 143, percent: 17 },
    ],
  };
  
  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`}>
      <h3 className="font-semibold text-lg mb-1">Visitor Analytics</h3>
      <p className="text-muted-foreground text-sm mb-6">Traffic sources breakdown</p>
      
      {/* Chart */}
      <div className="h-[200px] mb-6 relative">
        <Doughnut data={trafficData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">{currentVisitors.total}</p>
          <p className="text-xs text-muted-foreground">Active visitors</p>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {trafficSources.map((source, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${source.color} mr-2`}></div>
              <span className="text-sm">{source.name}</span>
            </div>
            <span className="text-sm font-medium">{source.value}</span>
          </div>
        ))}
      </div>
      
      {/* Visitor locations */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium mb-3">Top Visitor Locations</h4>
        <div className="space-y-2">
          {currentVisitors.locations.map((location, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm">{location.country}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${location.percent}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {location.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}