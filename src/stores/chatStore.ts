import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { ChatMessage, Conversation, Memory } from '@/types';

const SYSTEM_PROMPTS: Record<string, string> = {
    isis: `Você é Ring, uma assistente de IA pessoal, inteligente e carinhosa. Você está conversando com Isis, uma desenvolvedora de software. Você deve ser prestativa, técnica quando necessário, e sempre amigável. Você lembra de coisas que a Isis te conta e usa essas informações para ajudá-la melhor. Responda sempre em português do Brasil.`,
    angelica: `Você é Ring, uma assistente de IA pessoal, inteligente e carinhosa. Você está conversando com Angélica. Você deve ser prestativa, organizada e sempre amigável. Você lembra de coisas que a Angélica te conta e usa essas informações para ajudá-la melhor. Responda sempre em português do Brasil.`,
    familia: `Você é Ring, uma assistente de IA familiar. Você ajuda a família da Isis e da Angélica com organização, planejamento e qualquer dúvida. Seja amigável, organizada e considere as necessidades de toda a família. Responda sempre em português do Brasil.`,
};

interface ChatState {
    conversations: Record<string, Conversation>;
    activeConversationId: string | null;
    isLoading: boolean;
    ollamaStatus: 'online' | 'offline' | 'checking';
    ollamaModel: string;
    availableModels: string[];
    memories: Memory[];

    // Actions
    sendMessage: (workspaceId: string, content: string) => Promise<void>;
    createConversation: (workspaceId: string) => string;
    setActiveConversation: (id: string | null) => void;
    setOllamaModel: (model: string) => void;
    checkOllamaStatus: () => Promise<void>;
    loadModels: () => Promise<void>;
    getConversationsByWorkspace: (workspaceId: string) => Conversation[];
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: {},
    activeConversationId: null,
    isLoading: false,
    ollamaStatus: 'checking',
    ollamaModel: 'llama3.2',
    availableModels: [],
    memories: [],

    createConversation: (workspaceId) => {
        const id = Date.now().toString();
        const conversation: Conversation = {
            id,
            workspaceId,
            title: 'Nova conversa',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({
            conversations: { ...state.conversations, [id]: conversation },
            activeConversationId: id,
        }));
        return id;
    },

    setActiveConversation: (id) => set({ activeConversationId: id }),

    setOllamaModel: (model) => set({ ollamaModel: model }),

    sendMessage: async (workspaceId, content) => {
        const state = get();
        let conversationId = state.activeConversationId;

        if (!conversationId || !state.conversations[conversationId]) {
            conversationId = get().createConversation(workspaceId);
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
        };

        // Add user message
        set((state) => ({
            conversations: {
                ...state.conversations,
                [conversationId!]: {
                    ...state.conversations[conversationId!],
                    messages: [...state.conversations[conversationId!].messages, userMessage],
                    updatedAt: new Date().toISOString(),
                },
            },
            isLoading: true,
        }));

        try {
            const currentConv = get().conversations[conversationId];
            const ollamaMessages = currentConv.messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            // Get relevant memories for context
            const memories = get().memories
                .filter((m) => m.workspaceId === workspaceId)
                .map((m) => m.content)
                .join('\n');

            const systemPrompt =
                SYSTEM_PROMPTS[workspaceId] +
                (memories ? `\n\nMemórias relevantes:\n${memories}` : '');

            let responseContent: string;

            try {
                responseContent = await invoke<string>('chat_with_ollama', {
                    model: get().ollamaModel,
                    messages: ollamaMessages,
                    systemPrompt,
                });
            } catch {
                // Fallback: when Ollama is not available, generate a helpful response
                responseContent = generateFallbackResponse(content, workspaceId);
            }

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                createdAt: new Date().toISOString(),
            };

            // Update conversation title from first message
            const updatedTitle =
                currentConv.messages.length <= 1
                    ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
                    : currentConv.title;

            set((state) => ({
                conversations: {
                    ...state.conversations,
                    [conversationId!]: {
                        ...state.conversations[conversationId!],
                        messages: [...state.conversations[conversationId!].messages, assistantMessage],
                        title: updatedTitle,
                        updatedAt: new Date().toISOString(),
                    },
                },
                isLoading: false,
            }));

            // Extract and store memories
            extractMemories(responseContent, content, workspaceId, set);
        } catch {
            set({ isLoading: false });
        }
    },

    checkOllamaStatus: async () => {
        set({ ollamaStatus: 'checking' });
        try {
            const isOnline = await invoke<boolean>('check_ollama_status');
            set({ ollamaStatus: isOnline ? 'online' : 'offline' });
        } catch {
            set({ ollamaStatus: 'offline' });
        }
    },

    loadModels: async () => {
        try {
            const models = await invoke<string[]>('list_ollama_models');
            set({ availableModels: models });
            if (models.length > 0 && !models.includes(get().ollamaModel)) {
                set({ ollamaModel: models[0] });
            }
        } catch {
            set({ availableModels: [] });
        }
    },

    getConversationsByWorkspace: (workspaceId) => {
        return Object.values(get().conversations)
            .filter((c) => c.workspaceId === workspaceId)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
}));

// Helper: extract simple memories from conversation
function extractMemories(
    _aiResponse: string,
    userMessage: string,
    workspaceId: string,
    set: any
) {
    // Simple keyword-based memory extraction
    const memoryPatterns = [
        { regex: /(?:eu gosto|adoro|amo|prefiro)\s+(.+)/i, category: 'preference' as const },
        { regex: /(?:meu|minha)\s+(?:nome|aniversário|idade)\s+(?:é|será)\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:preciso|tenho que|devo)\s+(.+)/i, category: 'task' as const },
    ];

    for (const pattern of memoryPatterns) {
        const match = userMessage.match(pattern.regex);
        if (match) {
            const memory: Memory = {
                id: Date.now().toString(),
                workspaceId,
                content: userMessage,
                category: pattern.category,
                createdAt: new Date().toISOString(),
            };
            set((state: any) => ({
                memories: [...state.memories, memory],
            }));
            break;
        }
    }
}

// Fallback responses when Ollama is not running
function generateFallbackResponse(message: string, workspaceId: string): string {
    const greetings = ['olá', 'oi', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'e aí'];
    const isGreeting = greetings.some((g) => message.toLowerCase().includes(g));

    const names: Record<string, string> = {
        isis: 'Isis',
        angelica: 'Angélica',
        familia: 'pessoal',
    };

    if (isGreeting) {
        return `Olá, ${names[workspaceId]}! 🌟 Eu sou a Ring, sua assistente pessoal. Estou aqui para te ajudar com qualquer coisa!\n\n⚠️ **Nota:** O Ollama não está rodando no momento. Para respostas mais inteligentes, inicie o Ollama no seu computador com \`ollama serve\` e depois baixe um modelo com \`ollama pull llama3.2\`.`;
    }

    return `Entendi sua mensagem, ${names[workspaceId]}! 💭\n\nInfelizmente, o **Ollama não está conectado** no momento, então não consigo processar sua pergunta com a IA completa.\n\n**Para ativar a IA:**\n1. Abra o terminal\n2. Execute: \`ollama serve\`\n3. Baixe um modelo: \`ollama pull llama3.2\`\n\nQuando o Ollama estiver rodando, poderei te ajudar com muito mais profundidade! 🚀`;
}
