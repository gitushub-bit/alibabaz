import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching reviews:', error);
    } else {
        console.log('Reviews columns:', Object.keys(data[0] || {}));
    }
}

checkSchema();
