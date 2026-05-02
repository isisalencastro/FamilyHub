import { createClient } from '@supabase/supabase-js';

// ==============================================
// Configure as variáveis abaixo com os dados
// do seu projeto Supabase (Project Settings > API)
// ==============================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
        '⚠️ Supabase não configurado. Crie um arquivo .env com:\n' +
        'VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
        'VITE_SUPABASE_ANON_KEY=sua-anon-key'
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('SUA_URL_AQUI') && !SUPABASE_ANON_KEY.includes('SUA_CHAVE');
};
