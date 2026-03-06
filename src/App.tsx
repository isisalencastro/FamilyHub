import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Chat } from '@/pages/Chat';
import { Tasks } from '@/pages/Tasks';
import { Projects } from '@/pages/Projects';
import { Finance } from '@/pages/Finance';
import { Docs } from '@/pages/Docs';
import { Integrations } from '@/pages/Integrations';
import { CalendarView } from '@/pages/CalendarView';
import { SettingsPage } from '@/pages/Settings';
import { Shopping } from '@/pages/Shopping';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useDocStore } from '@/stores/docStore';
import { useChatStore } from '@/stores/chatStore';
import { isSupabaseConfigured } from '@/lib/supabase';

function App() {
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const subscribeTasksRealtime = useTaskStore((s) => s.subscribeRealtime);

  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const subscribeProjectsRealtime = useProjectStore((s) => s.subscribeRealtime);

  const fetchTransactions = useFinanceStore((s) => s.fetchTransactions);
  const subscribeFinanceRealtime = useFinanceStore((s) => s.subscribeRealtime);

  const fetchDocuments = useDocStore((s) => s.fetchDocuments);
  const subscribeDocsRealtime = useDocStore((s) => s.subscribeRealtime);

  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const fetchMemories = useChatStore((s) => s.fetchMemories);
  const subscribeChatRealtime = useChatStore((s) => s.subscribeRealtime);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase não configurado — rodando em modo local (dados em memória).');
      return;
    }

    // Fetch all data on startup
    fetchTasks();
    fetchProjects();
    fetchTransactions();
    fetchDocuments();
    fetchConversations();
    fetchMemories();

    // Subscribe to realtime changes
    const unsubTasks = subscribeTasksRealtime();
    const unsubProjects = subscribeProjectsRealtime();
    const unsubFinance = subscribeFinanceRealtime();
    const unsubDocs = subscribeDocsRealtime();
    const unsubChat = subscribeChatRealtime();

    return () => {
      unsubTasks();
      unsubProjects();
      unsubFinance();
      unsubDocs();
      unsubChat();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
