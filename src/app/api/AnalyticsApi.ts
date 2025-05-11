// pages/api/track-page-view.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/src/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { pageUrl, sessionId, userAgent, referer, ipInfo, visitorId, duration, eventType, eventData } = req.body;
    
    // Handle page view tracking
    if (pageUrl) {
      return await trackPageView(req, res, pageUrl, sessionId, userAgent, referer, ipInfo);
    } 
    // Handle visit duration update
    else if (visitorId !== undefined && duration !== undefined) {
      return await updateVisitorDuration(req, res, visitorId, duration);
    }
    // Handle visitor event tracking
    else if (visitorId !== undefined && eventType) {
      return await trackVisitorEvent(req, res, visitorId, eventType, eventData);
    }
    else {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
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
}

// Function to track page view
async function trackPageView(
  req: NextApiRequest, 
  res: NextApiResponse,
  pageUrl: string, 
  sessionId?: string, 
  userAgent?: string, 
  referer?: string, 
  ipInfo?: any
) {
  if (!pageUrl) {
    return res.status(400).json({ message: 'Missing required field: pageUrl' });
  }
  
  const supabase = await createClient();
  const visitorId = uuidv4();
  
  // Parse user agent
  const { browser, os, deviceType, isBot } = parseUserAgent(userAgent || req.headers['user-agent'] || '');
  
  // Create visitor record
  const { data, error } = await supabase
    .from('visitors')
    .insert({
      id: visitorId,
      session_id: sessionId || uuidv4(),
      user_agent: userAgent || req.headers['user-agent'],
      browser,
      os,
      device_type: deviceType,
      is_bot: isBot,
      ip_address: ipInfo?.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      country: ipInfo?.country,
      region: ipInfo?.region,
      city: ipInfo?.city,
      latitude: ipInfo?.latitude,
      longitude: ipInfo?.longitude,
      page_url: pageUrl,
      referer: referer || req.headers.referer,
      visited_at: new Date().toISOString(),
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return res.status(200).json(data);
}

// Function to update visitor duration
async function updateVisitorDuration(
  req: NextApiRequest, 
  res: NextApiResponse,
  visitorId: string, 
  duration: number
) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('visitors')
    .update({ 
      duration_seconds: duration,
      updated_at: new Date().toISOString()
    })
    .eq('id', visitorId);
  
  if (error) throw error;
  
  return res.status(200).json({ success: true });
}

// Function to track visitor event
async function trackVisitorEvent(
  req: NextApiRequest, 
  res: NextApiResponse,
  visitorId: string, 
  eventType: string, 
  eventData?: any
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('visitor_events')
    .insert({
      id: uuidv4(),
      visitor_id: visitorId,
      event_type: eventType,
      event_data: eventData || {},
      event_time: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return res.status(200).json(data);
}