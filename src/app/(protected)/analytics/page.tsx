"use client";

import { useState } from 'react';
import { useVisitorAnalytics } from '@/src/hook/useVisitor';
import AnalyticsDashboard from '@/src/components/analytics/AnalyticsDashboard';
import VisitorOverview from '@/src/components/analytics/VisitorOverview';
import VisitorTrends from '@/src/components/analytics/VisitorTrends';
import PagePerformance from '@/src/components/analytics/PagePerformance';
import TrafficSourcesAnalysis from '@/src/components/analytics/TrafficSourcesAnalysis';
import VisitorBehavior from '@/src/components/analytics/VisitorBehavior';
import ComparisonMetrics from '@/src/components/analytics/ComparisonMetrics';
import FilterPanel from '@/src/components/analytics/FilterPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { CustomLoader, PageLoader, ButtonLoader } from "@/src/components/ui/Loader";
import { MinLoadingTime } from '@/src/utils/client/MinLoadingTime';

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState<string>("overview");
    
    // Initialize analytics hook with default filters
    const analytics = useVisitorAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        groupBy: 'day',
        compareWithPrevious: true,
        limit: 10
    });
    
    // Gunakan MinLoadingTime untuk memastikan loader tampil minimal 2 detik
    const isLoading = MinLoadingTime(analytics.loading, 2000);

    // Jika sedang loading, tampilkan loader dengan animasi custom
    if (isLoading) {
        return <PageLoader text="Memuat data analitik..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header with title and description */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Detailed insights about your visitors and page performance.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 self-start">
                    <button
                        onClick={() => analytics.refreshStats()}
                        className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 text-sm font-medium transition-colors gap-2"
                        disabled={analytics.loading}
                    >
                        {analytics.loading ? (
                            <>
                                <ButtonLoader />
                                <span>Refreshing...</span>
                            </>
                        ) : 'Refresh Data'}
                    </button>
                    
                    <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
                        Export Report
                    </button>
                </div>
            </div>

            <AnalyticsDashboard analytics={analytics} />
            
            {/* Filter Panel */}
            <FilterPanel 
                analytics={analytics}
                className="sticky top-0 z-10 pt-3 pb-3 bg-background/95 backdrop-blur-sm" 
            />
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <VisitorOverview 
                    analytics={analytics} 
                    className="lg:col-span-2"
                />
                <ComparisonMetrics 
                    analytics={analytics} 
                    className="lg:col-span-1"
                />
            </div>
            
            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="overview">Visitor Trends</TabsTrigger>
                    <TabsTrigger value="pages">Page Performance</TabsTrigger>
                    <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
                    <TabsTrigger value="behavior">User Behavior</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                    <VisitorTrends analytics={analytics} />
                </TabsContent>
                
                <TabsContent value="pages">
                    <PagePerformance analytics={analytics} />
                </TabsContent>
                
                <TabsContent value="sources">
                    <TrafficSourcesAnalysis analytics={analytics} />
                </TabsContent>
                
                <TabsContent value="behavior">
                    <VisitorBehavior analytics={analytics} />
                </TabsContent>
            </Tabs>
        </div>
    );
}