"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { BarChart3, ArrowUp, ArrowDown, Clock, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend
);

interface PagePerformanceProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function PagePerformance({ analytics, className = "" }: PagePerformanceProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    // Use topPages from the hook or generate placeholder data if empty
    const pages = analytics.topPages.length > 0 ? analytics.topPages : [
        { page_url: "/dashboard", count: 1245, avgDuration: 180 },
        { page_url: "/products", count: 985, avgDuration: 125 },
        { page_url: "/blog/getting-started", count: 876, avgDuration: 320 },
        { page_url: "/about", count: 654, avgDuration: 95 },
        { page_url: "/pricing", count: 543, avgDuration: 110 },
        { page_url: "/contact", count: 432, avgDuration: 85 },
        { page_url: "/blog/advanced-techniques", count: 398, avgDuration: 245 },
        { page_url: "/docs/installation", count: 376, avgDuration: 275 },
        { page_url: "/user/profile", count: 321, avgDuration: 155 },
        { page_url: "/blog", count: 298, avgDuration: 130 }
    ];
    
    // Prepare data for horizontal bar chart
    const chartLabels = pages.slice(0, 5).map(page => {
        const url = new URL(page.page_url, 'https://example.com');
        return url.pathname;
    });
    
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Page Views',
                data: pages.slice(0, 5).map(page => page.count),
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 200, 0);
                    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
                    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.3)');
                    return gradient;
                },
                borderRadius: 4,
            }
        ]
    };
    
    const chartOptions = {
        indexAxis: 'y' as const,
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
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
                    drawBorder: false,
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                }
            }
        }
    };
    
    // Format time in seconds to mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Top Pages</h3>
                </div>
                <div className="h-[350px]">
                    <Bar data={chartData} options={chartOptions as any} />
                </div>
            </div>
            
            <div className="lg:col-span-2 rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold mb-6">Page Performance Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">URL</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground whitespace-nowrap">Page Views</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground whitespace-nowrap">Avg. Time</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">Change</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="px-3 py-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                                            <span className="text-sm font-medium">{page.page_url}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-center">
                                        {page.count.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-sm">{formatTime(page.avgDuration)}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center justify-center">
                                            {i % 2 === 0 ? (
                                                <div className="flex items-center text-emerald-500">
                                                    <ArrowUp className="h-3.5 w-3.5 mr-1" />
                                                    <span className="text-sm">
                                                        {(Math.random() * 10 + 2).toFixed(1)}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-rose-500">
                                                    <ArrowDown className="h-3.5 w-3.5 mr-1" />
                                                    <span className="text-sm">
                                                        {(Math.random() * 8 + 1).toFixed(1)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
                                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}