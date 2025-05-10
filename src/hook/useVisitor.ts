import { useState, useEffect, useCallback } from 'react';
import { VisitorService } from '@/src/services/VisitorServices';
import { Visitor, VisitorEvent } from '@/src/models/VisitorModels';

interface AnalyticsPeriod {
  startDate: string;
  endDate: string;
}

interface AnalyticsFilters extends AnalyticsPeriod {
  groupBy?: 'day' | 'week' | 'month' | 'year';
  compareWithPrevious?: boolean;
  limit?: number;
}

interface ComparisonResult {
  current: {
    totalVisits: number;
    uniqueVisitors: number;
  };
  previous: {
    totalVisits: number;
    uniqueVisitors: number;
  };
  changes: {
    visitsPercent: number;
    uniqueVisitorsPercent: number;
  };
}

interface PageViewStats {
  page_url: string;
  count: number;
  avgDuration: number;
}

interface TrafficSource {
  referer: string;
  count: number;
  percent: number;
}

export const useVisitorAnalytics = (initialFilters?: AnalyticsFilters) => {
  const [currentVisitor, setCurrentVisitor] = useState<Visitor | null>(null);
  const [visitorStats, setVisitorStats] = useState<any[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<number>(0);
  const [topPages, setTopPages] = useState<PageViewStats[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(
    initialFilters || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      groupBy: 'day'
    }
  );

  // Initialize tracking on page load
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        const visitor = await VisitorService.trackPageView(window.location.href);
        setCurrentVisitor(visitor);
      } catch (err) {
        console.error('Error initializing tracking:', err);
      }
    };
    
    initializeTracking();
  }, []);

  // Track page view on route change
  useEffect(() => {
    const handleRouteChange = async (url: string) => {
      try {
        const visitor = await VisitorService.trackPageView(url);
        setCurrentVisitor(visitor);
      } catch (err) {
        console.error('Error tracking route change:', err);
      }
    };
    
    // This depends on your router implementation
    // For example, with Next.js:
    // const router = useRouter();
    // router.events.on('routeChangeComplete', handleRouteChange);
    // return () => {
    //   router.events.off('routeChangeComplete', handleRouteChange);
    // };
    
    // For manual tracking in other frameworks:
    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.href);
    });
    
    return () => {
      window.removeEventListener('popstate', () => {
        handleRouteChange(window.location.href);
      });
    };
  }, []);

  // Fetch visitor stats based on filters
  const fetchVisitorStats = useCallback(async () => {
    try {
      setLoading(true);
      
      const [stats, uniqueCount, pages, sources] = await Promise.all([
        VisitorService.getVisitorStats({
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupBy: filters.groupBy
        }),
        VisitorService.getUniqueVisitorsCount({
          startDate: filters.startDate,
          endDate: filters.endDate
        }),
        VisitorService.getTopPages({
          startDate: filters.startDate,
          endDate: filters.endDate,
          limit: filters.limit || 10
        }),
        VisitorService.getTrafficSources({
          startDate: filters.startDate,
          endDate: filters.endDate,
          limit: filters.limit || 10
        })
      ]);
      
      setVisitorStats(stats);
      setUniqueVisitors(uniqueCount);
      setTopPages(pages);
      setTrafficSources(sources);
      
      // Fetch comparison data if requested
      if (filters.compareWithPrevious) {
        await fetchComparisonData();
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Calculate and fetch comparison data
  const fetchComparisonData = useCallback(async () => {
    try {
      const currentStart = new Date(filters.startDate);
      const currentEnd = new Date(filters.endDate);
      
      // Calculate the same length previous period
      const periodLength = currentEnd.getTime() - currentStart.getTime();
      const previousEnd = new Date(currentStart.getTime() - 1); // 1 day before current period
      const previousStart = new Date(previousEnd.getTime() - periodLength);
      
      const comparisonData = await VisitorService.comparePeriods({
        currentStart: filters.startDate,
        currentEnd: filters.endDate,
        previousStart: previousStart.toISOString().split('T')[0],
        previousEnd: previousEnd.toISOString().split('T')[0]
      });
      
      setComparison(comparisonData);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setComparison(null);
    }
  }, [filters]);

  // Track custom events
  const trackEvent = useCallback(async (
    eventType: string,
    eventData: Record<string, any> = {}
  ): Promise<VisitorEvent | null> => {
    if (!currentVisitor) return null;
    
    try {
      return await VisitorService.trackEvent(
        currentVisitor.id,
        eventType,
        eventData
      );
    } catch (err) {
      console.error('Error tracking event:', err);
      return null;
    }
  }, [currentVisitor]);

  // Helper function for tracking scroll depth
  const trackScrollDepth = useCallback(() => {
    if (!currentVisitor) return;
    
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
      
      const thresholds = [25, 50, 75, 90, 100];
      
      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && maxScroll < threshold) {
          maxScroll = threshold;
          trackEvent('scroll_depth', { depth: threshold });
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentVisitor, trackEvent]);

  // Fetch data when filters change
  useEffect(() => {
    fetchVisitorStats();
  }, [fetchVisitorStats]);

  // Helper function to format date ranges
  const getDateRanges = useCallback(() => {
    return {
      today: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      yesterday: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      last7Days: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      last30Days: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      thisMonth: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      lastMonth: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
          .toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
          .toISOString().split('T')[0]
      },
      thisYear: {
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      lastYear: {
        startDate: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear() - 1, 11, 31).toISOString().split('T')[0]
      }
    };
  }, []);

  return {
    // Current tracking
    currentVisitor,
    trackEvent,
    trackScrollDepth,
    
    // Analytics data
    visitorStats,
    uniqueVisitors,
    topPages,
    trafficSources,
    comparison,
    
    // State
    loading,
    error,
    
    // Filters and controls
    filters,
    setFilters,
    getDateRanges,
    refreshStats: fetchVisitorStats,
    
    // Helper methods
    formatPercentChange: (value: number) => {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    }
  };
};