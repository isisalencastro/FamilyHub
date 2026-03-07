import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, MessageSquarePlus, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useChatStore } from '@/stores/chatStore';

export function Chat() {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { activeWorkspace } = useWorkspaceStore();
    const {
        conversations,
        activeConversationId,
        isLoading,
        aiModel,
        aiStatus,
        sendMessage,
        createConversation,
        setActiveConversation,
        getConversationsByWorkspace,
    } = useChatStore();

    const wsConversations = getConversationsByWorkspace(activeWorkspace.id);
    const activeConversation = activeConversationId
        ? conversations[activeConversationId]
        : null;

    // Reset active conversation when workspace changes
    useEffect(() => {
        const currentConv = activeConversationId ? conversations[activeConversationId] : null;
        if (currentConv && currentConv.workspaceId !== activeWorkspace.id) {
            setActiveConversation(null);
        }
    }, [activeWorkspace.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages?.length, isLoading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeConversationId]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        setInput('');
        await sendMessage(activeWorkspace.id, trimmed);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        createConversation(activeWorkspace.id);
    };

    return (
        <div className="chat-layout">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-avatar">
                        <Bot size={22} color="white" />
                    </div>
                    <div>
                        <div className="chat-title">Ring</div>
                        <div className="chat-model">
                            {aiStatus === 'online' ? `OpenAI · ${aiModel}` : 'API não configurada'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={handleNewChat}>
                        <MessageSquarePlus size={16} />
                        Nova conversa
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Conversation List */}
                {wsConversations.length > 0 && (
                    <div
                        style={{
                            width: '240px',
                            minWidth: '240px',
                            borderRight: '1px solid var(--color-border-default)',
                            background: 'var(--color-bg-secondary)',
                            overflowY: 'auto',
                            padding: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: 'var(--color-text-tertiary)',
                                padding: '8px',
                                marginBottom: '4px',
                            }}
                        >
                            Conversas
                        </div>
                        {wsConversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`nav-item ${activeConversationId === conv.id ? 'active' : ''}`}
                                onClick={() => setActiveConversation(conv.id)}
                                style={{
                                    fontSize: '13px',
                                    padding: '8px 10px',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <span
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                    }}
                                >
                                    {conv.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Messages */}
                    <div className="chat-messages">
                        {!activeConversation || activeConversation.messages.length === 0 ? (
                            <WelcomeScreen onQuickAction={(text) => {
                                setInput(text);
                                inputRef.current?.focus();
                            }} />
                        ) : (
                            activeConversation.messages.map((msg) => (
                                <div key={msg.id} className={`message ${msg.role}`}>
                                    <div className={`message-avatar ${msg.role}`}>
                                        {msg.role === 'assistant' ? (
                                            <Bot size={16} />
                                        ) : (
                                            activeWorkspace.avatar
                                        )}
                                    </div>
                                    <div className="message-content">
                                        {msg.content.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                {i < msg.content.split('\n').length - 1 && <br />}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar assistant">
                                    <Bot size={16} />
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <div className="typing-dot" />
                                        <div className="typing-dot" />
                                        <div className="typing-dot" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-area">
                        <div className="chat-input-wrapper">
                            <textarea
                                ref={inputRef}
                                className="chat-input"
                                placeholder="Mensagem para Ring..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />
                            <button
                                className="chat-send-btn"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div
                            style={{
                                fontSize: '11px',
                                color: 'var(--color-text-tertiary)',
                                marginTop: '8px',
                                textAlign: 'center',
                            }}
                        >
                            Ring pode cometer erros. Verifique informações importantes.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WelcomeScreen({ onQuickAction }: { onQuickAction: (text: string) => void }) {
    const quickActions = [
        {
            icon: <Sparkles size={16} />,
            text: 'Me ajude a organizar meu dia',
            color: 'var(--color-accent-muted)',
            iconColor: 'var(--color-accent-primary)',
        },
        {
            icon: <MessageSquarePlus size={16} />,
            text: 'Crie uma lista de tarefas',
            color: 'rgba(59, 130, 246, 0.15)',
            iconColor: 'var(--color-info)',
        },
        {
            icon: <Bot size={16} />,
            text: 'Quais são minhas prioridades?',
            color: 'rgba(34, 197, 94, 0.15)',
            iconColor: 'var(--color-success)',
        },
        {
            icon: <Trash2 size={16} />,
            text: 'Resuma meus projetos atuais',
            color: 'rgba(245, 158, 11, 0.15)',
            iconColor: 'var(--color-warning)',
        },
    ];

    return (
        <div className="welcome-section">
            <div className="welcome-icon">
                <Bot size={36} color="white" />
            </div>
            <h2 className="welcome-title">Como posso te ajudar?</h2>
            <p className="welcome-text">
                Eu sou a Ring, sua assistente pessoal com IA. Posso te ajudar com tarefas,
                organização, ideias e muito mais.
            </p>
            <div className="quick-actions">
                {quickActions.map((action, i) => (
                    <button
                        key={i}
                        className="quick-action"
                        onClick={() => onQuickAction(action.text)}
                    >
                        <div
                            className="quick-action-icon"
                            style={{ background: action.color, color: action.iconColor }}
                        >
                            {action.icon}
                        </div>
                        <span className="quick-action-text">{action.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
