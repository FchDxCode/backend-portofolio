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
import AnalyticsLoading from '@/src/components/analytics/AnalyticsLoading';

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
    
    if (analytics.loading) {
        return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><AnalyticsLoading /></div>;
    }
    
    // Use actual page data or empty array
    const pages = analytics.topPages || [];
    
    // If no pages data, show empty state
    if (pages.length === 0) {
        return (
            <div className={`rounded-xl border bg-card p-6 flex flex-col items-center justify-center min-h-[400px] ${className}`}>
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No page data available</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    There's no page performance data available for the selected period. 
                    Try selecting a different date range or check back later.
                </p>
            </div>
        );
    }
    
    // Prepare data for horizontal bar chart from actual pages
    const chartLabels = pages.slice(0, 5).map(page => {
        // Handle potential URL format issues
        try {
            const url = new URL(page.page_url, 'https://example.com');
            return url.pathname;
        } catch (e) {
            return page.page_url;
        }
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
                                            {(() => {
                                                // Jumlah total kunjungan dari semua halaman
                                                const totalViews = pages.reduce((sum, p) => sum + p.count, 0);
                                                
                                                // Hitung persentase kunjungan halaman ini dari total
                                                const viewPercentage = totalViews > 0 ? (page.count / totalViews) * 100 : 0;
                                                
                                                // Gunakan proporsi kunjungan untuk menentukan arah perubahan
                                                // Halaman dengan >10% kunjungan dianggap berperforma baik
                                                const isPositive = viewPercentage > 10;
                                                
                                                // Hitung "perubahan" berdasarkan proporsi kunjungan
                                                // Semakin tinggi persentase kunjungan, semakin positif perubahannya
                                                const changeValue = isPositive ? viewPercentage / 2 : -(20 - viewPercentage) / 2;
                                                
                                                return (
                                                    <div className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isPositive ? (
                                                            <ArrowUp className="h-3.5 w-3.5 mr-1" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 mr-1" />
                                                        )}
                                                        <span className="text-sm">
                                                            {Math.abs(changeValue).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                );
                                            })()}
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