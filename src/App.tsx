import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Tasks } from '@/pages/Tasks';
import { Finance } from '@/pages/Finance';
import { Docs } from '@/pages/Docs';
import { CalendarView } from '@/pages/CalendarView';
import { MenusView } from '@/pages/MenusView';
import { SettingsPage } from '@/pages/Settings';
import { Pets } from '@/pages/Pets';

import { useTaskStore } from '@/stores/taskStore';
import { useFinanceStore } from '@/stores/financeStore';

import { isSupabaseConfigured } from '@/lib/supabase';
import { requestNotificationPermission, checkReminders } from '@/lib/notificationService';

function App() {
  const fetchTasks = useTaskStore((s: any) => s.fetchTasks);
  const subscribeTasksRealtime = useTaskStore((s: any) => s.subscribeRealtime);

  const fetchTransactions = useFinanceStore((s: any) => s.fetchTransactions);
  const subscribeFinanceRealtime = useFinanceStore((s: any) => s.subscribeRealtime);

  const allTasks = useTaskStore((s: any) => s.tasks);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase não configurado — rodando em modo local (dados em memória).');
      return;
    }

    // Fetch all data on startup
    fetchTasks();
    fetchTransactions();

    // Subscribe to realtime changes
    const unsubTasks = subscribeTasksRealtime();
    const unsubFinance = subscribeFinanceRealtime();

    return () => {
      unsubTasks();
      unsubFinance();
    };
  }, []);

  // ── Notification Reminders ──
  useEffect(() => {
    requestNotificationPermission();

    // Check reminders on load and every 30 minutes
    const runReminders = () => checkReminders(allTasks);
    const timeout = setTimeout(runReminders, 5000); // wait 5s after load
    const interval = setInterval(runReminders, 30 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [allTasks]);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/menus" element={<MenusView />} />

          <Route path="/pets" element={<Pets />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
