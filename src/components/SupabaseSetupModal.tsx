import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { X } from 'lucide-react';

export function SupabaseSetupModal() {
  const [isOpen, setIsOpen] = useState(!isSupabaseConfigured());

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--color-bg-primary, #ffffff)',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        color: 'var(--color-text-primary, #000)'
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-secondary, #666)'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
          ⚠️ Supabase Não Configurado
        </h2>
        
        <p style={{ lineHeight: 1.5, marginBottom: '1rem' }}>
          O Family Hub está rodando em <strong>modo local (memória)</strong>. Os dados não serão salvos permanentemente ou sincronizados entre múltiplos dispositivos.
        </p>

        <p style={{ lineHeight: 1.5, marginBottom: '1rem' }}>
          Para habilitar a nuvem e usar em vários PCs, você precisa configurar o seu próprio Supabase (que é um banco de dados gratuito):
        </p>

        <ol style={{ lineHeight: 1.6, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>supabase.com</a></li>
          <li>Crie um novo projeto e vá em <em>Project Settings &gt; API</em></li>
          <li>Copie a <strong>URL</strong> e a <strong>anon key</strong></li>
          <li>Abra o arquivo <code>.env</code> na pasta do sistema e cole os valores em <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code></li>
          <li>Leia o arquivo <code>setup.md</code> incluído no projeto para instruções de como rodar os scripts SQL necessários!</li>
        </ol>

        <button 
          onClick={() => setIsOpen(false)}
          style={{
            background: 'var(--color-primary, #3b82f6)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          Entendi, continuar offline por enquanto
        </button>
      </div>
    </div>
  );
}
