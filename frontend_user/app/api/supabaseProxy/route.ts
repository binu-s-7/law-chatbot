// pages/api/supabaseProxy.js
import {createClient} from '@supabase/supabase-js';

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: 'Only POST requests allowed'});
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Example: Fetching data from Supabase (adjust according to your needs)
    const {data, error} = await supabase
        .from('profiles')
        .select('*');

    if (error) return res.status(500).json({error});
    res.status(200).json(data);
}
