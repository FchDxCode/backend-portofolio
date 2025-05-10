"use client";

import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import { 
    MousePointerClick, 
    Clock, 
    ArrowRight, 
    LineChart,
    BarChart4,
    Smartphone,
    Laptop,
    Tablet,
    Monitor,
    ArrowDown
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title
);

interface VisitorBehaviorProps {
    analytics: ReturnType<typeof useVisitorAnalytics>;
    className?: string;
}

export default function VisitorBehavior({ analytics, className = "" }: VisitorBehaviorProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [deviceView, setDeviceView] = useState<'devices' | 'browsers'>('devices');
    
    // Placeholder data for device distribution
    const deviceData = {
        labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
        datasets: [
            {
                data: [48, 38, 12, 2],
                backgroundColor: [
                    'rgb(59, 130, 246)', // blue
                    'rgb(124, 58, 237)', // purple
                    'rgb(236, 72, 153)', // pink
                    'rgb(75, 85, 99)', // gray
                ],
                borderColor: isDark ? '#1f2937' : 'white',
                borderWidth: 2,
                hoverOffset: 5,
            },
        ],
    };
    
    // Placeholder data for browser distribution
    const browserData = {
        labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'],
        datasets: [
            {
                data: [56, 22, 12, 8, 2],
                backgroundColor: [
                    'rgb(59, 130, 246)', // blue
                    'rgb(124, 58, 237)', // purple
                    'rgb(236, 72, 153)', // pink
                    'rgb(245, 158, 11)', // amber
                    'rgb(75, 85, 99)', // gray
                ],
                borderColor: isDark ? '#1f2937' : 'white',
                borderWidth: 2,
                hoverOffset: 5,
            },
        ],
    };
    
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 11,
                    },
                    color: isDark ? '#d1d5db' : '#4b5563',
                }
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
    
    // User engagement data over time (placeholder)
    const engagementLabels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return date.toLocaleDateString('en-US', { month: 'short' });
    });
    
    const engagementData = {
        labels: engagementLabels,
        datasets: [
            {
                label: 'Pages per Visit',
                data: [2.8, 2.9, 3.1, 3.0, 3.2, 3.4, 3.6, 3.5, 3.7, 3.8, 3.7, 3.9],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Avg. Duration (min)',
                data: [2.2, 2.3, 2.4, 2.3, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.0, 3.2],
                borderColor: 'rgb(124, 58, 237)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
            },
        ],
    };
    
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 11,
                    },
                    color: isDark ? '#d1d5db' : '#4b5563',
                }
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
            y: {
                beginAtZero: true,
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Pages',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    font: {
                        size: 11,
                    }
                },
                grid: {
                    color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
                    drawBorder: false,
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                }
            },
            y1: {
                beginAtZero: true,
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'Minutes',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    font: {
                        size: 11,
                    }
                },
                grid: {
                    display: false,
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                }
            }
        },
    };
    
    // User journey funnel data (placeholder)
    const journeySteps = [
        { name: "Homepage Visit", visitors: 28450, percent: 100 },
        { name: "Product Browse", visitors: 18493, percent: 65 },
        { name: "Add to Cart", visitors: 9258, percent: 33 },
        { name: "Checkout", visitors: 5690, percent: 20 },
        { name: "Purchase", visitors: 3414, percent: 12 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Metrics */}
            <div className="lg:col-span-2 rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-lg">User Engagement</h3>
                        <p className="text-sm text-muted-foreground">Engagement metrics over time</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                    </div>
                </div>
                
                <div className="h-[300px] mb-6">
                    <Line data={engagementData} options={lineOptions as any} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t pt-6">
                    <div className="bg-accent/40 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <MousePointerClick className="h-4 w-4 text-blue-500" />
                            <h4 className="text-sm font-medium">Click Rate</h4>
                        </div>
                        <p className="text-2xl font-semibold mt-2">8.7%</p>
                        <p className="text-xs text-muted-foreground mt-1">+1.2% vs prev.</p>
                    </div>
                    <div className="bg-accent/40 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <h4 className="text-sm font-medium">Time on Site</h4>
                        </div>
                        <p className="text-2xl font-semibold mt-2">3:12</p>
                        <p className="text-xs text-muted-foreground mt-1">+0:18 vs prev.</p>
                    </div>
                    <div className="bg-accent/40 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <BarChart4 className="h-4 w-4 text-pink-500" />
                            <h4 className="text-sm font-medium">Bounce Rate</h4>
                        </div>
                        <p className="text-2xl font-semibold mt-2">42.3%</p>
                        <p className="text-xs text-muted-foreground mt-1">-4.5% vs prev.</p>
                    </div>
                    <div className="bg-accent/40 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-amber-500" />
                            <h4 className="text-sm font-medium">Exit Rate</h4>
                        </div>
                        <p className="text-2xl font-semibold mt-2">23.8%</p>
                        <p className="text-xs text-muted-foreground mt-1">-1.7% vs prev.</p>
                    </div>
                </div>
            </div>
            
            {/* Device Distribution */}
            <div className="lg:col-span-1 rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Device Distribution</h3>
                    <div className="flex bg-muted rounded-lg p-1">
                        <button
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                deviceView === 'devices' 
                                    ? 'bg-card text-foreground shadow-sm' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setDeviceView('devices')}
                        >
                            Devices
                        </button>
                        <button
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                deviceView === 'browsers' 
                                    ? 'bg-card text-foreground shadow-sm' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => setDeviceView('browsers')}
                        >
                            Browsers
                        </button>
                    </div>
                </div>
                
                <div className="h-[220px] mb-4">
                    <Pie 
                        data={deviceView === 'devices' ? deviceData : browserData} 
                        options={pieOptions as any} 
                    />
                </div>
                
                {deviceView === 'devices' && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Laptop className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Desktop</p>
                                    <p className="text-xs text-muted-foreground">{deviceData.datasets[0].data[0]}% of visits</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">13,680</p>
                                <p className="text-xs text-emerald-500">+5.2%</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Smartphone className="h-4 w-4 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Mobile</p>
                                    <p className="text-xs text-muted-foreground">{deviceData.datasets[0].data[1]}% of visits</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">10,830</p>
                                <p className="text-xs text-emerald-500">+8.7%</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                                    <Tablet className="h-4 w-4 text-pink-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Tablet</p>
                                    <p className="text-xs text-muted-foreground">{deviceData.datasets[0].data[2]}% of visits</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">3,420</p>
                                <p className="text-xs text-rose-500">-2.1%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* User Journey */}
            <div className="lg:col-span-3 rounded-xl border bg-card p-6">
                <h3 className="font-semibold text-lg mb-6">User Journey Funnel</h3>
                
                <div className="space-y-4">
                    {journeySteps.map((step, i) => (
                        <div key={i} className="relative">
                            {i < journeySteps.length - 1 && (
                                <div className="absolute left-[50%] -bottom-4 z-10">
                                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-accent/30">
                                <div className="sm:w-1/4">
                                    <h4 className="text-sm font-medium">{step.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {i > 0 ? `${((step.visitors / journeySteps[i-1].visitors) * 100).toFixed(1)}% conversion rate` : 'Starting point'}
                                    </p>
                                </div>
                                
                                <div className="flex-1">
                                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${step.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="sm:w-1/6 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{step.visitors.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">visitors</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{step.percent}%</p>
                                        <p className="text-xs text-muted-foreground">of total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Conversion Rate Analysis</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Overall funnel conversion rate: {((journeySteps[journeySteps.length - 1].visitors / journeySteps[0].visitors) * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-sm text-primary hover:underline">
                                View Full Report
                            </button>
                            <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
                                Optimize Funnel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}