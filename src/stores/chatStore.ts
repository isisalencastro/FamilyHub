import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatWithOpenAI, getOpenAIApiKey, getOpenAIModel, isOpenAIConfigured } from '@/lib/openaiClient';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
    aiStatus: 'online' | 'offline' | 'checking';
    aiModel: string;
    memories: Memory[];
    customInstructions: Record<string, string>;

    // Actions
    sendMessage: (workspaceId: string, content: string) => Promise<void>;
    createConversation: (workspaceId: string) => Promise<string>;
    setActiveConversation: (id: string | null) => void;
    setAiModel: (model: string) => void;
    setCustomInstruction: (workspaceId: string, instruction: string) => void;
    getCustomInstruction: (workspaceId: string) => string;
    checkAiStatus: () => Promise<void>;
    getConversationsByWorkspace: (workspaceId: string) => Conversation[];
    fetchConversations: () => Promise<void>;
    fetchMemories: () => Promise<void>;
    subscribeRealtime: () => () => void;
}

const loadCustomInstructions = (): Record<string, string> => {
    try {
        return JSON.parse(localStorage.getItem('ring_custom_instructions') || '{}');
    } catch {
        return {};
    }
};

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: {},
            activeConversationId: null,
            isLoading: false,
            aiStatus: 'checking',
            aiModel: getOpenAIModel(),
            memories: [],
            customInstructions: loadCustomInstructions(),

            setCustomInstruction: (workspaceId: string, instruction: string) => {
                set((state) => {
                    const newInstructions = { ...state.customInstructions, [workspaceId]: instruction };
                    localStorage.setItem('ring_custom_instructions', JSON.stringify(newInstructions));
                    return { customInstructions: newInstructions };
                });
            },

            getCustomInstruction: (workspaceId: string) => {
                return get().customInstructions[workspaceId] || '';
            },

            fetchConversations: async () => {
                if (!isSupabaseConfigured()) return;

                const { data: convData } = await supabase
                    .from('conversations')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (!convData) return;

                const conversations: Record<string, Conversation> = {};

                for (const conv of convData) {
                    const { data: msgData } = await supabase
                        .from('chat_messages')
                        .select('*')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: true });

                    conversations[conv.id] = {
                        id: conv.id,
                        workspaceId: conv.workspace_id,
                        title: conv.title || 'Nova conversa',
                        messages: (msgData || []).map((m) => ({
                            id: m.id,
                            role: m.role as 'user' | 'assistant',
                            content: m.content,
                            createdAt: m.created_at,
                        })),
                        createdAt: conv.created_at,
                        updatedAt: conv.updated_at,
                    };
                }

                set({ conversations });
            },

            fetchMemories: async () => {
                if (!isSupabaseConfigured()) return;

                const { data } = await supabase
                    .from('memories')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (data) {
                    set({
                        memories: data.map((m) => ({
                            id: m.id,
                            workspaceId: m.workspace_id,
                            content: m.content,
                            category: m.category,
                            createdAt: m.created_at,
                        })),
                    });
                }
            },

            createConversation: async (workspaceId) => {
                if (!isSupabaseConfigured()) {
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
                }

                const { data, error } = await supabase
                    .from('conversations')
                    .insert({ workspace_id: workspaceId, title: 'Nova conversa' })
                    .select()
                    .single();

                if (error || !data) {
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
                }

                const conversation: Conversation = {
                    id: data.id,
                    workspaceId: data.workspace_id,
                    title: data.title,
                    messages: [],
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                };
                set((state) => ({
                    conversations: { ...state.conversations, [data.id]: conversation },
                    activeConversationId: data.id,
                }));
                return data.id;
            },

            setActiveConversation: (id) => set({ activeConversationId: id }),

            setAiModel: (model) => {
                localStorage.setItem('openai_model', model);
                set({ aiModel: model });
            },

            sendMessage: async (workspaceId, content) => {
                const state = get();
                let conversationId = state.activeConversationId;

                if (!conversationId || !state.conversations[conversationId]) {
                    conversationId = await get().createConversation(workspaceId);
                }

                const userMessage: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'user',
                    content,
                    createdAt: new Date().toISOString(),
                };

                // Add user message locally
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

                // Save user message to Supabase
                if (isSupabaseConfigured()) {
                    const { data: savedMsg } = await supabase
                        .from('chat_messages')
                        .insert({ conversation_id: conversationId, role: 'user', content })
                        .select()
                        .single();
                    if (savedMsg) {
                        userMessage.id = savedMsg.id;
                    }
                }

                try {
                    const currentConv = get().conversations[conversationId];
                    const chatMessages = currentConv.messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    }));

                    const memories = get().memories
                        .filter((m) => m.workspaceId === workspaceId)
                        .map((m) => m.content)
                        .join('\n');

                    const customInstruction = get().getCustomInstruction(workspaceId);

                    const systemPrompt =
                        SYSTEM_PROMPTS[workspaceId] +
                        (customInstruction ? `\n\nInstruções Personalizadas do Perfil:\n${customInstruction}` : '') +
                        (memories ? `\n\nMemórias relevantes:\n${memories}` : '');

                    let responseContent: string;

                    if (isOpenAIConfigured()) {
                        try {
                            responseContent = await chatWithOpenAI({
                                model: get().aiModel,
                                messages: chatMessages,
                                systemPrompt,
                                apiKey: getOpenAIApiKey(),
                            });
                        } catch (err) {
                            responseContent = `⚠️ **Erro ao conectar com a OpenAI:**\n\n${(err as Error).message}\n\nVerifique sua API Key nas Configurações.`;
                        }
                    } else {
                        responseContent = generateFallbackResponse(content, workspaceId);
                    }

                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: responseContent,
                        createdAt: new Date().toISOString(),
                    };

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

                    // Save assistant message + update title in Supabase
                    if (isSupabaseConfigured()) {
                        await supabase
                            .from('chat_messages')
                            .insert({ conversation_id: conversationId, role: 'assistant', content: responseContent });
                        await supabase
                            .from('conversations')
                            .update({ title: updatedTitle, updated_at: new Date().toISOString() })
                            .eq('id', conversationId);
                    }

                    // Extract and store memories
                    extractMemories(responseContent, content, workspaceId, set, get);
                } catch {
                    set({ isLoading: false });
                }
            },

            checkAiStatus: async () => {
                set({ aiStatus: 'checking' });
                if (isOpenAIConfigured()) {
                    set({ aiStatus: 'online' });
                } else {
                    set({ aiStatus: 'offline' });
                }
            },

            getConversationsByWorkspace: (workspaceId) => {
                return Object.values(get().conversations)
                    .filter((c) => c.workspaceId === workspaceId)
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            },

            subscribeRealtime: () => {
                if (!isSupabaseConfigured()) return () => { };

                const channel = supabase
                    .channel('chat-changes')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => {
                        get().fetchConversations();
                    })
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, () => {
                        get().fetchMemories();
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            },
        }),
        {
            name: 'alenfinos-chat',
            partialize: (state) => ({
                conversations: state.conversations,
                activeConversationId: state.activeConversationId,
                memories: state.memories,
            }),
        }
    )
);

// Helper: extract simple memories from conversation
function extractMemories(
    _aiResponse: string,
    userMessage: string,
    workspaceId: string,
    set: any,
    get: any
) {
    const memoryPatterns = [
        { regex: /(?:eu gosto|adoro|amo|prefiro|curto)\s+(.+)/i, category: 'preference' as const },
        { regex: /(?:não gosto|odeio|detesto|não curto)\s+(.+)/i, category: 'preference' as const },
        { regex: /(?:minha comida|meu prato|minha cor|meu filme|meu livro|minha música)\s+(?:favorit[oa]|preferid[oa])?\s*(?:é|:)\s+(.+)/i, category: 'preference' as const },
        { regex: /(?:meu|minha)\s+(?:nome|aniversário|idade|signo)\s+(?:é|será|vai ser)\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:eu tenho|estou com)\s+(\d+)\s+anos/i, category: 'fact' as const },
        { regex: /(?:eu moro|a gente mora|moramos)\s+(?:em|no|na)\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:eu trabalho|trabalho)\s+(?:em|no|na|com)\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:sou alérgic[oa]|tenho alergia)\s+(?:a|de)\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:tomo|uso)\s+(?:o|a)?\s*(?:remédio|medicamento|medicação)\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:aniversário|niver)\s+(?:d[oa]|é\s+(?:dia|em))\s+(.+)/i, category: 'fact' as const },
        { regex: /(?:a consulta|o compromisso|a reunião)\s+(?:é|vai ser)\s+(?:dia|em|no dia)\s+(.+)/i, category: 'task' as const },
        { regex: /(?:preciso|tenho que|devo|não posso esquecer)\s+(?:de\s+)?(.+)/i, category: 'task' as const },
        { regex: /(?:me lembra|lembre-me|lembra-me)\s+(?:de\s+)?(.+)/i, category: 'task' as const },
        { regex: /(?:amanhã|semana que vem|mês que vem|depois)\s+(?:tenho|preciso|vou)\s+(.+)/i, category: 'task' as const },
        { regex: /(?:meu salário|ganho|recebo)\s+(?:é\s+(?:de\s+)?)?(?:R\$\s*)?([\d.,]*)/i, category: 'fact' as const },
        { regex: /(?:a angélica|a isis|o breno|a mãe|o pai)\s+(?:gosta|adora|não gosta|prefere)\s+(.+)/i, category: 'preference' as const },
        { regex: /(?:nosso pet|nosso gato|nosso cachorro|nosso animal)\s+(?:se chama|é)\s+(.+)/i, category: 'fact' as const },
    ];

    const existingMemories = get().memories.filter((m: Memory) => m.workspaceId === workspaceId);
    const isDuplicate = existingMemories.some((m: Memory) =>
        m.content.toLowerCase().trim() === userMessage.toLowerCase().trim()
    );
    if (isDuplicate) return;

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

            if (isSupabaseConfigured()) {
                supabase.from('memories').insert({
                    workspace_id: workspaceId,
                    content: userMessage,
                    category: pattern.category,
                });
            }
            break;
        }
    }
}

// Fallback responses when OpenAI is not configured
function generateFallbackResponse(message: string, workspaceId: string): string {
    const greetings = ['olá', 'oi', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'e aí'];
    const isGreeting = greetings.some((g) => message.toLowerCase().includes(g));

    const names: Record<string, string> = {
        isis: 'Isis',
        angelica: 'Angélica',
        familia: 'pessoal',
    };

    if (isGreeting) {
        return `Olá, ${names[workspaceId]}! 🌟 Eu sou a Ring, sua assistente pessoal.\n\n⚠️ **A API Key da OpenAI não está configurada.**\nVá em **Configurações** e insira sua chave de API para que eu possa te ajudar com inteligência total!`;
    }

    return `Entendi sua mensagem, ${names[workspaceId]}! 💭\n\nInfelizmente, a **API Key da OpenAI não está configurada** no momento.\n\n**Para ativar a Ring:**\n1. Vá em **Configurações**\n2. Cole sua API Key da OpenAI\n3. Escolha um modelo (recomendo GPT-4o Mini)\n\nAssim poderei te ajudar com muito mais profundidade! 🚀`;
}
