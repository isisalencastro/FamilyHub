// ============================================
// Ollama Client — Dual Mode (Browser + Tauri)
// ============================================
// Detects environment automatically:
// - Tauri: uses IPC invoke() for native performance
// - Browser: uses fetch() directly to Ollama HTTP API
// ============================================

const isTauri = (): boolean => !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;

/**
 * Check if Ollama is running and reachable
 */
export async function checkOllamaStatus(ollamaHost: string): Promise<boolean> {
    if (isTauri()) {
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            return await invoke<boolean>('check_ollama_status', { ollamaHost });
        } catch {
            return false;
        }
    }

    // Browser mode: direct HTTP request
    try {
        const protocol = ollamaHost.startsWith('https') ? '' : 'http://';
        const res = await fetch(`${protocol}${ollamaHost}/api/version`, {
            signal: AbortSignal.timeout(3000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * List available Ollama models
 */
export async function listOllamaModels(ollamaHost: string): Promise<string[]> {
    if (isTauri()) {
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            return await invoke<string[]>('list_ollama_models', { ollamaHost });
        } catch {
            return [];
        }
    }

    // Browser mode: direct HTTP request
    try {
        const protocol = ollamaHost.startsWith('https') ? '' : 'http://';
        const res = await fetch(`${protocol}${ollamaHost}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.models || []).map((m: any) => m.name || m.model);
    } catch {
        return [];
    }
}

/**
 * Chat with Ollama — send messages and get AI response
 */
export async function chatWithOllama(params: {
    model: string;
    messages: { role: string; content: string }[];
    systemPrompt: string;
    ollamaHost: string;
}): Promise<string> {
    const { model, messages, systemPrompt, ollamaHost } = params;

    if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<string>('chat_with_ollama', {
            model,
            messages,
            systemPrompt,
            ollamaHost,
        });
    }

    // Browser mode: direct HTTP request to Ollama /api/chat
    const protocol = ollamaHost.startsWith('https') ? '' : 'http://';

    const ollamaMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];

    const res = await fetch(`${protocol}${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: ollamaMessages,
            stream: false,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return data.message?.content || data.response || '';
}

/**
 * Helper to check if running in Tauri context
 */
export { isTauri };
