import { createClient } from '@supabase/supabase-js';

// ここは「変数の名前」を書く場所！中身のURLやKeyを直接書いちゃダメだよ。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// これで、.env.local に書いた実際のURLとKeyが自動的にここに入るんだ。
export const supabase = createClient(supabaseUrl, supabaseAnonKey);