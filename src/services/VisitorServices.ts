import { createClient } from "@/src/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Visitor, VisitorEvent } from "@/src/models/VisitorModels";

const supabase = createClient();

// Simple User-Agent parser (minimal implementation)
const parseUserAgent = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opr") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("msie") || ua.includes("trident")) browser = "Internet Explorer";
  
  // OS detection
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";
  
  // Device type detection
  let deviceType = "Unknown";
  if (ua.includes("mobile")) deviceType = "Mobile";
  else if (ua.includes("tablet")) deviceType = "Tablet";
  else deviceType = "Desktop";
  
  // Bot detection
  const isBot = /bot|crawler|spider|crawling/i.test(ua);
  
  return { browser, os, deviceType, isBot };
};

export class VisitorService {
  private static VISITORS_TABLE = 'visitors';
  private static EVENTS_TABLE = 'visitor_events';
  private static SESSION_COOKIE = 'visitor_session_id';
  private static SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes

  /**
   * Gets or creates a session ID
   */
  static getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_COOKIE);
    const sessionTimestamp = localStorage.getItem(`${this.SESSION_COOKIE}_timestamp`);
    
    // Check if session exists and is not expired
    if (sessionId && sessionTimestamp) {
      const timestamp = parseInt(sessionTimestamp, 10);
      if (Date.now() - timestamp < this.SESSION_EXPIRY) {
        // Update timestamp to extend session
        localStorage.setItem(`${this.SESSION_COOKIE}_timestamp`, Date.now().toString());
        return sessionId;
      }
    }
    
    // Create new session
    sessionId = uuidv4();
    localStorage.setItem(this.SESSION_COOKIE, sessionId);
    localStorage.setItem(`${this.SESSION_COOKIE}_timestamp`, Date.now().toString());
    return sessionId;
  }

  /**
   * Track a page view
   */
  static async trackPageView(pageUrl: string): Promise<Visitor | null> {
    // Uncomment line ini untuk beta-testing API
    // return await this.trackPageViewViaAPI(pageUrl);
    
    // Untuk sementara, kembalikan null dan log pesan untuk admin
    console.log('Page tracking disabled temporarily while API is being prepared');
    return null;
  }

  /**
   * Track a page view via new API (akan digunakan nanti)
   */
  static async trackPageViewViaAPI(pageUrl: string): Promise<Visitor | null> {
    try {
      const sessionId = this.getSessionId();
      const visitorId = uuidv4();
      const userAgent = navigator.userAgent;
      const { browser, os, deviceType, isBot } = parseUserAgent(userAgent);
      const referer = document.referrer || null;
      
      // Get IP and geolocation data
      const geoData = await this.getIPAndGeoData();
      
      // Call new API endpoint
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl,
          sessionId,
          userAgent,
          referer,
          ipInfo: geoData
        })
      });
      
      if (!response.ok) throw new Error('Failed to track via API');
      
      return await response.json();
    } catch (error) {
      console.error('Error tracking page view via API:', error);
      return null;
    }
  }

  /**
   * Track user events
   */
  static async trackEvent(
    visitorId: string,
    eventType: string,
    eventData: Record<string, any> = {}
  ): Promise<VisitorEvent | null> {
    // Uncomment ini untuk beta-testing API
    // return await this.trackEventViaAPI(visitorId, eventType, eventData);
    
    // Untuk sementara, kembalikan null dan log pesan untuk admin
    console.log('Event tracking disabled temporarily while API is being prepared');
    return null;
  }

  /**
   * Track event via new API (akan digunakan nanti)
   */
  static async trackEventViaAPI(
    visitorId: string,
    eventType: string,
    eventData: Record<string, any> = {}
  ): Promise<VisitorEvent | null> {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          eventType,
          eventData
        })
      });
      
      if (!response.ok) throw new Error('Failed to track event via API');
      
      return await response.json();
    } catch (error) {
      console.error(`Error tracking event ${eventType} via API:`, error);
      return null;
    }
  }

  /**
   * Get IP and geolocation data from public API
   */
  private static async getIPAndGeoData(): Promise<any> {
    try {
      // Use a free IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('Failed to get IP data');
      return await response.json();
    } catch (error) {
      console.error('Error getting IP/geo data:', error);
      return null;
    }
  }

  /**
   * Get visitor analytics data
   */
  static async getVisitorStats(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
  }): Promise<any> {
    try {
      let query = supabase
        .from(this.VISITORS_TABLE)
        .select('*');
      
      if (params?.startDate) {
        query = query.gte('visited_at', params.startDate);
      }
      
      if (params?.endDate) {
        query = query.lte('visited_at', params.endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Process data for stats based on groupBy
      if (params?.groupBy) {
        return this.processVisitorStatsByDate(data, params.groupBy);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      throw error;
    }
  }

  /**
   * Get visitor events data
   */
  static async getEventStats(params?: {
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      let query = supabase
        .from(this.EVENTS_TABLE)
        .select(`
          *,
          visitors (id, page_url, visited_at)
        `);
      
      if (params?.eventType) {
        query = query.eq('event_type', params.eventType);
      }
      
      if (params?.startDate) {
        query = query.gte('event_time', params.startDate);
      }
      
      if (params?.endDate) {
        query = query.lte('event_time', params.endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting event stats:', error);
      throw error;
    }
  }

  /**
   * Get unique visitors count - menggunakan query langsung
   */
  static async getUniqueVisitorsCount(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    try {
      let query = supabase
        .from(this.VISITORS_TABLE)
        .select('session_id');
      
      if (params?.startDate) {
        query = query.gte('visited_at', params.startDate);
      }
      
      if (params?.endDate) {
        query = query.lte('visited_at', params.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Hitung jumlah session_id unik
      const uniqueSessions = new Set();
      data.forEach(visitor => {
        if (visitor.session_id) {
          uniqueSessions.add(visitor.session_id);
        }
      });
      
      return uniqueSessions.size;
    } catch (error) {
      console.error('Error getting unique visitors count:', error);
      return 0;
    }
  }

  /**
   * Get top pages - tanpa fallback data statis
   */
  static async getTopPages(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from(this.VISITORS_TABLE)
        .select('page_url, duration_seconds');
      
      if (params?.startDate) {
        query = query.gte('visited_at', params.startDate);
      }
      
      if (params?.endDate) {
        query = query.lte('visited_at', params.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Proses data untuk menghitung statistik halaman top
      const pageStats: Record<string, { count: number, totalDuration: number }> = {};
      
      // Hitung jumlah visit dan total durasi per halaman
      data.forEach(visit => {
        const page = visit.page_url;
        if (!pageStats[page]) {
          pageStats[page] = { count: 0, totalDuration: 0 };
        }
        pageStats[page].count++;
        pageStats[page].totalDuration += visit.duration_seconds || 0;
      });
      
      // Konversi ke array dan hitung rata-rata durasi
      const result = Object.entries(pageStats).map(([page_url, stats]) => ({
        page_url,
        count: stats.count,
        avgDuration: Math.round(stats.totalDuration / stats.count) || 0
      }));
      
      // Sortir berdasarkan jumlah kunjungan dan batasi jumlah hasil
      return result
        .sort((a, b) => b.count - a.count)
        .slice(0, params?.limit || 10);
    } catch (error) {
      console.error('Error getting top pages:', error);
      // Return array kosong saat error, tanpa fallback data statis
      return [];
    }
  }

  /**
   * Get traffic sources - tanpa fallback data statis
   */
  static async getTrafficSources(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = supabase
        .from(this.VISITORS_TABLE)
        .select('referer');
      
      if (params?.startDate) {
        query = query.gte('visited_at', params.startDate);
      }
      
      if (params?.endDate) {
        query = query.lte('visited_at', params.endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Proses referer untuk kategorisasi
      const refererCounts: Record<string, number> = {};
      let totalVisits = 0;
      
      data.forEach(visit => {
        totalVisits++;
        
        // Kategorisasi referer
        let category = 'direct';
        const referer = visit.referer;
        
        if (referer) {
          if (referer.includes('google') || referer.includes('bing') || referer.includes('yahoo')) {
            category = 'organic';
          } else if (referer.includes('facebook') || referer.includes('twitter') || 
                    referer.includes('instagram') || referer.includes('linkedin')) {
            category = 'social';
          } else if (referer.includes('mail') || referer.includes('outlook') || referer.includes('gmail')) {
            category = 'email';
          } else {
            category = 'referral';
          }
        }
        
        refererCounts[category] = (refererCounts[category] || 0) + 1;
      });
      
      // Konversi ke array dan hitung persentase
      const result = Object.entries(refererCounts).map(([referer, count]) => ({
        referer,
        count,
        percent: Math.round((count / totalVisits) * 100)
      }));
      
      // Sortir berdasarkan jumlah dan batasi jumlah hasil
      return result
        .sort((a, b) => b.count - a.count)
        .slice(0, params?.limit || 10);
    } catch (error) {
      console.error('Error getting traffic sources:', error);
      // Return array kosong saat error, tanpa fallback data statis
      return [];
    }
  }

  /**
   * Process visitor data by date grouping
   */
  private static processVisitorStatsByDate(
    visitors: Visitor[],
    groupBy: 'day' | 'week' | 'month' | 'year'
  ): any {
    const stats: Record<string, {
      count: number;
      uniqueSessions: Set<string>;
      totalDuration: number;
      avgDuration: number;
    }> = {};
    
    visitors.forEach(visitor => {
      let dateKey: string;
      const visitDate = new Date(visitor.visited_at || new Date().toISOString());
      
      switch (groupBy) {
        case 'day':
          dateKey = visitDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          // Get week number (approximate method)
          const weekNum = Math.ceil((visitDate.getDate() + 
            new Date(visitDate.getFullYear(), visitDate.getMonth(), 1).getDay()) / 7);
          dateKey = `${visitDate.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          dateKey = `${visitDate.getFullYear()}-${String(visitDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          dateKey = `${visitDate.getFullYear()}`;
          break;
      }
      
      if (!stats[dateKey]) {
        stats[dateKey] = {
          count: 0,
          uniqueSessions: new Set(),
          totalDuration: 0,
          avgDuration: 0
        };
      }
      
      stats[dateKey].count++;
      stats[dateKey].uniqueSessions.add(visitor.session_id);
      stats[dateKey].totalDuration += visitor.duration_seconds || 0;
    });
    
    // Calculate averages and convert sets to counts
    const result = Object.entries(stats).map(([date, data]) => ({
      date,
      visits: data.count,
      uniqueVisitors: data.uniqueSessions.size,
      avgDuration: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0
    }));
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Compare periods
   */
  static async comparePeriods(params: {
    currentStart: string;
    currentEnd: string;
    previousStart: string;
    previousEnd: string;
  }): Promise<any> {
    try {
      const [currentData, previousData] = await Promise.all([
        this.getVisitorStats({
          startDate: params.currentStart,
          endDate: params.currentEnd
        }),
        this.getVisitorStats({
          startDate: params.previousStart,
          endDate: params.previousEnd
        })
      ]);
      
      const currentCount = currentData.length;
      const previousCount = previousData.length;
      
      const currentUnique = new Set(currentData.map((v: Visitor) => v.session_id)).size;
      const previousUnique = new Set(previousData.map((v: Visitor) => v.session_id)).size;
      
      const percentChangeVisits = previousCount === 0 
        ? 100 
        : ((currentCount - previousCount) / previousCount * 100);
        
      const percentChangeUnique = previousUnique === 0 
        ? 100 
        : ((currentUnique - previousUnique) / previousUnique * 100);
      
      return {
        current: {
          totalVisits: currentCount,
          uniqueVisitors: currentUnique
        },
        previous: {
          totalVisits: previousCount,
          uniqueVisitors: previousUnique
        },
        changes: {
          visitsPercent: percentChangeVisits,
          uniqueVisitorsPercent: percentChangeUnique
        }
      };
    } catch (error) {
      console.error('Error comparing periods:', error);
      throw error;
    }
  }
}