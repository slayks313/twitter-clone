import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // Используешь service_role, не anon
);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const data = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        await supabase
            .from('collected_history')
            .insert([{ ip, data: JSON.stringify(data) }]);
        
        res.status(200).json({ status: 'ok' });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}