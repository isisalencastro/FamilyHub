import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Chat } from '@/pages/Chat';
import { Tasks } from '@/pages/Tasks';
import { Projects } from '@/pages/Projects';
import { SettingsPage } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
