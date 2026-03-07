import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageCircle,
    CheckSquare,
    FolderKanban,
    Bot,
    Settings,
    Wallet,
    FileText,
    Link as LinkIcon,
    Calendar as CalendarIcon,
    Home,
    Users,
    User,
    Sun,
    Moon,
    ShoppingCart
} from 'lucide-react';
import { useWorkspaceStore, WORKSPACES } from '@/stores/workspaceStore';
import { useChatStore } from '@/stores/chatStore';
import { useThemeStore } from '@/stores/themeStore';
import type { Workspace } from '@/types';
import { useEffect } from 'react';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
    const { ollamaStatus, checkOllamaStatus, setActiveConversation } = useChatStore();
    const { theme, toggleTheme } = useThemeStore();

    const handleSwitchWorkspace = (wsId: string) => {
        if (wsId !== activeWorkspace.id) {
            const ws = WORKSPACES.find(w => w.id === wsId)!;
            setActiveWorkspace(ws);
            setActiveConversation(null);
            navigate('/');
        }
    };

    useEffect(() => {
        checkOllamaStatus();
        const interval = setInterval(checkOllamaStatus, 30000);
        return () => clearInterval(interval);
    }, [checkOllamaStatus]);

    const isFamilia = activeWorkspace.id === 'familia';

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard', show: true },
        { path: '/calendar', icon: CalendarIcon, label: 'Calendário', show: true },
        { path: '/tasks', icon: CheckSquare, label: 'Tarefas', show: true },
        { path: '/projects', icon: FolderKanban, label: 'Projetos', show: true },
        { path: '/shopping', icon: ShoppingCart, label: 'Compras', show: isFamilia },
        { path: '/finance', icon: Wallet, label: 'Finanças', show: isFamilia },
        { path: '/docs', icon: FileText, label: 'Documentos', show: isFamilia },
        { path: '/integrations', icon: LinkIcon, label: 'Integrações', show: isFamilia },
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <Home size={20} color="white" />
                    </div>
                    <span className="sidebar-brand-name">Alenfinos Hub</span>
                </div>
            </div>

            {/* Navigation Context */}
            <div className="workspace-label" style={{ marginTop: '20px', padding: '0 20px' }}>
                {isFamilia ? 'Menu Principal' : `Espaço de ${activeWorkspace.displayName}`}
            </div>

            {/* Navigation */}
            <nav className="nav-section">
                {navItems
                    .filter((item) => item.show)
                    .map((item) => (
                        <div
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </div>
                    ))}
            </nav>

            {/* Footer switcher and Chat */}
            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>

                {/* Theme Toggle */}
                <div className="theme-toggle" onClick={toggleTheme}>
                    <span className="theme-toggle-label">
                        {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                    </span>
                    <div className={`theme-toggle-track ${theme}`}>
                        <div className={`theme-toggle-knob ${theme}`}>
                            {theme === 'light'
                                ? <Sun size={12} color="#f59e0b" />
                                : <Moon size={12} color="#a5b4fc" />
                            }
                        </div>
                    </div>
                </div>

                <div style={{ height: '8px' }} />

                <div className="workspace-label" style={{ padding: '8px 16px 4px', borderTop: '1px solid var(--color-border-default)', paddingTop: '16px' }}>
                    Alternar Perfil
                </div>

                <div
                    className={`nav-item ${activeWorkspace.id === 'familia' ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace('familia')}
                    style={{ marginBottom: '4px' }}
                >
                    <div style={{
                        width: 18, height: 18, borderRadius: '6px',
                        background: 'linear-gradient(135deg, var(--color-ws-familia), #0891b2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Users size={11} color="white" />
                    </div>
                    <span>Visão Geral</span>
                </div>

                <div
                    className={`nav-item ${activeWorkspace.id === 'isis' ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace('isis')}
                    style={{ marginBottom: '4px' }}
                >
                    <div className="workspace-avatar isis" style={{ width: 18, height: 18, fontSize: 10, margin: 0 }}>I</div>
                    <span>Perfil de Isis</span>
                </div>

                <div
                    className={`nav-item ${activeWorkspace.id === 'angelica' ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace('angelica')}
                    style={{ marginBottom: '4px' }}
                >
                    <div className="workspace-avatar angelica" style={{ width: 18, height: 18, fontSize: 10, margin: 0 }}>A</div>
                    <span>Perfil de Angélica</span>
                </div>

                <div style={{ height: '12px' }}></div>
                {/* Chat link */}
                <div
                    className={`nav-item ${location.pathname === '/chat' ? 'active' : ''}`}
                    onClick={() => navigate('/chat')}
                >
                    <MessageCircle size={18} />
                    <span>Chat com Ring</span>
                </div>

                <div className="ollama-status" style={{ marginTop: '8px' }}>
                    <div
                        className={`status-dot ${ollamaStatus === 'online' ? 'online' : 'offline'}`}
                    />
                    <span>
                        {ollamaStatus === 'online'
                            ? 'Ring conectada'
                            : ollamaStatus === 'checking'
                                ? 'Verificando...'
                                : 'Ring offline'}
                    </span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                    style={{ marginTop: '8px' }}
                    onClick={() => navigate('/settings')}
                >
                    <Settings size={18} />
                    <span>Configurações</span>
                </div>
            </div>
        </aside>
    );
}
