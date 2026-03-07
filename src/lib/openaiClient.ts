// ============================================
// OpenAI Client — Chat Completions API
// ============================================
// Uses the OpenAI REST API directly via fetch
// No SDK needed — works in both Browser and Tauri
// ============================================

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Load the API key from localStorage
 */
export function getOpenAIApiKey(): string {
    return localStorage.getItem('openai_api_key') || '';
}

/**
 * Save the API key to localStorage
 */
export function setOpenAIApiKey(key: string): void {
    localStorage.setItem('openai_api_key', key);
}

/**
 * Get the saved model or default
 */
export function getOpenAIModel(): string {
    return localStorage.getItem('openai_model') || 'gpt-4o-mini';
}

/**
 * Save the preferred model
 */
export function setOpenAIModel(model: string): void {
    localStorage.setItem('openai_model', model);
}

/**
 * Check if OpenAI is configured (has API key)
 */
export function isOpenAIConfigured(): boolean {
    const key = getOpenAIApiKey();
    return !!key && key.startsWith('sk-');
}

/**
 * Validate the API key by making a small request
 */
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
    try {
        const res = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(8000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Chat with OpenAI — send messages and get AI response
 */
export async function chatWithOpenAI(params: {
    model: string;
    messages: { role: string; content: string }[];
    systemPrompt: string;
    apiKey: string;
}): Promise<string> {
    const { model, messages, systemPrompt, apiKey } = params;

    if (!apiKey) {
        throw new Error('API Key da OpenAI não configurada.');
    }

    const openaiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];

    const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: openaiMessages,
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `OpenAI error (${res.status})`;
        throw new Error(errorMessage);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Available OpenAI models for the user to choose
 */
export const OPENAI_MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Rápido e econômico. Ótimo para uso diário.', price: '~$0.15/1M tokens' },
    { id: 'gpt-4o', name: 'GPT-4o', desc: 'Mais inteligente e capaz. Para conversas complexas.', price: '~$2.50/1M tokens' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', desc: 'Nova geração, boa qualidade. Balanço custo/desempenho.', price: '~$0.40/1M tokens' },
    { id: 'gpt-4.1', name: 'GPT-4.1', desc: 'Última geração. Máxima qualidade.', price: '~$2.00/1M tokens' },
];
