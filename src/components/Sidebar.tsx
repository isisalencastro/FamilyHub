import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Settings,
    Wallet,
    FileText,
    Calendar as CalendarIcon,
    Home,
    Sun,
    Moon,
    PawPrint,
    UtensilsCrossed
} from 'lucide-react';
import { useWorkspaceStore, WORKSPACES } from '@/stores/workspaceStore';
import { useThemeStore } from '@/stores/themeStore';
import type { Workspace } from '@/types';
import { useEffect } from 'react';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
    const { theme, toggleTheme } = useThemeStore();

    const handleSwitchWorkspace = (wsId: string) => {
        if (wsId !== activeWorkspace.id) {
            const ws = WORKSPACES.find(w => w.id === wsId)!;
            setActiveWorkspace(ws);
            navigate('/');
        }
    };

    const isFamilia = activeWorkspace.id === 'familia';

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/calendar', icon: CalendarIcon, label: 'Calendário' },
        { path: '/tasks', icon: CheckSquare, label: 'Tarefas' },
        { path: '/menus', icon: UtensilsCrossed, label: 'Cardápios' },
        { path: '/pets', icon: PawPrint, label: 'Pets' },
        { path: '/finance', icon: Wallet, label: 'Finanças' },
        { path: '/docs', icon: FileText, label: 'Documentos' },
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

            {/* Footer */}
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
