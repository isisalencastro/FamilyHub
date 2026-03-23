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
import { useShoppingStore } from '@/stores/shoppingStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useCalendarCommentsStore } from '@/stores/calendarCommentsStore';
import { useGoalStore } from '@/stores/goalStore';
import { usePetStore } from '@/stores/petStore';
import { useMenuStore } from '@/stores/menuStore';
import { useFamilyFinanceStore } from '@/stores/familyFinanceStore';
import { useDocStore } from '@/stores/docStore';
import { useUpdateStore } from '@/stores/updateStore';

import { isSupabaseConfigured } from '@/lib/supabase';
import { UpdateToast } from '@/components/UpdateToast';
import { requestNotificationPermission, checkReminders } from '@/lib/notificationService';

function App() {
  // ── Existing stores ──
  const fetchTasks = useTaskStore((s: any) => s.fetchTasks);
  const subscribeTasksRealtime = useTaskStore((s: any) => s.subscribeRealtime);

  const fetchTransactions = useFinanceStore((s: any) => s.fetchTransactions);
  const subscribeFinanceRealtime = useFinanceStore((s: any) => s.subscribeRealtime);

  // ── New stores ──
  const fetchShoppingData = useShoppingStore((s) => s.fetchData);
  const subscribeShoppingRealtime = useShoppingStore((s) => s.subscribeRealtime);

  const fetchCalendarEvents = useCalendarStore((s) => s.fetchEvents);
  const subscribeCalendarRealtime = useCalendarStore((s) => s.subscribeRealtime);

  const fetchCalendarComments = useCalendarCommentsStore((s) => s.fetchComments);
  const subscribeCalendarCommentsRealtime = useCalendarCommentsStore((s) => s.subscribeRealtime);

  const fetchGoals = useGoalStore((s) => s.fetchGoals);
  const subscribeGoalsRealtime = useGoalStore((s) => s.subscribeRealtime);

  const fetchPets = usePetStore((s) => s.fetchPets);
  const subscribePetsRealtime = usePetStore((s) => s.subscribeRealtime);

  const fetchMeals = useMenuStore((s) => s.fetchMeals);
  const subscribeMealsRealtime = useMenuStore((s) => s.subscribeRealtime);

  const fetchFamilyFinance = useFamilyFinanceStore((s) => s.fetchAll);
  const subscribeFamilyFinanceRealtime = useFamilyFinanceStore((s) => s.subscribeRealtime);

  const fetchDocs = useDocStore((s) => s.loadDocuments);
  const subscribeDocsRealtime = useDocStore((s) => s.subscribeRealtime);

  const checkForUpdate = useUpdateStore((s) => s.checkForUpdate);
  const subscribeUpdateRealtime = useUpdateStore((s) => s.subscribeRealtime);

  const allTasks = useTaskStore((s: any) => s.tasks);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase não configurado — rodando em modo local (dados em memória).');
      return;
    }

    // Fetch all data on startup
    fetchTasks();
    fetchTransactions();
    fetchShoppingData();
    fetchCalendarEvents();
    fetchCalendarComments();
    fetchGoals();
    fetchPets();
    fetchMeals();
    fetchFamilyFinance();
    fetchDocs();
    checkForUpdate();

    // Subscribe to realtime changes
    const unsubTasks = subscribeTasksRealtime();
    const unsubFinance = subscribeFinanceRealtime();
    const unsubShopping = subscribeShoppingRealtime();
    const unsubCalendar = subscribeCalendarRealtime();
    const unsubCalendarComments = subscribeCalendarCommentsRealtime();
    const unsubGoals = subscribeGoalsRealtime();
    const unsubPets = subscribePetsRealtime();
    const unsubMeals = subscribeMealsRealtime();
    const unsubFamilyFinance = subscribeFamilyFinanceRealtime();
    const unsubDocs = subscribeDocsRealtime();
    const unsubUpdate = subscribeUpdateRealtime();

    return () => {
      unsubTasks();
      unsubFinance();
      unsubShopping();
      unsubCalendar();
      unsubCalendarComments();
      unsubGoals();
      unsubPets();
      unsubMeals();
      unsubFamilyFinance();
      unsubDocs();
      unsubUpdate();
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
      <UpdateToast />
    </BrowserRouter>
  );
}

export default App;
