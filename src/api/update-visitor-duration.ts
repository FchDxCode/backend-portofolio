import { createClient } from "@/src/utils/supabase/server";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visitorId, duration } = req.body;
  if (!visitorId || duration === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('visitors')
      .update({ 
        duration_seconds: duration,
        updated_at: new Date().toISOString()
      })
      .eq('id', visitorId);

    if (error) throw error;
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating visitor duration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}