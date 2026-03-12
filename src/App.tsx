import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Building2,
  Users,
  FolderOpen,
  Bell,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import DealPipeline from './DealPipeline';
import OpportunityIntake from './OpportunityIntake';
import Documents from './Documents';
import CapitalDesk from './CapitalDesk';
import Participation from './Participation';
import Notifications from './Notifications';
import Dashboard from './Dashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isDark, setIsDark] = useState(true);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Opportunity Intake', icon: FileText },
    { name: 'Deal Pipeline', icon: TrendingUp },
    { name: 'Capital Desk', icon: Building2 },
    { name: 'Participation', icon: Users },
    { name: 'Documents', icon: FolderOpen },
    { name: 'Notifications', icon: Bell },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a]' : 'bg-gray-50'} transition-colors`}>
      {/* Top Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-[#1e293b]' : 'bg-white'} border-b ${isDark ? 'border-[#1f2937]' : 'border-gray-200'}`}>
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#0f172a]' : 'hover:bg-gray-100'} transition-colors`}
            >
              {sidebarOpen ? (
                <X className={isDark ? 'text-gray-300' : 'text-gray-600'} size={24} />
              ) : (
                <Menu className={isDark ? 'text-gray-300' : 'text-gray-600'} size={24} />
              )}
            </button>
            <h1 className="navbar-brand">UBUYBOX</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? 'bg-[#0f172a] text-[#f59e0b]' : 'bg-gray-100 text-gray-600'} transition-all hover:scale-110`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gradient-to-br from-[#f59e0b] to-[#d97706]' : 'bg-gradient-to-br from-blue-500 to-blue-600'} flex items-center justify-center text-white font-semibold`}>
              U
            </div>
          </div>
        </div>
      </nav>

      {/* Left Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 ${isDark ? 'bg-[#1e293b]' : 'bg-white'} border-r ${isDark ? 'border-[#1f2937]' : 'border-gray-200'} transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  isActive
                    ? 'active text-[#f59e0b]'
                    : isDark
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Workspace */}
      <main
        className={`transition-all duration-300 pt-16 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          {activeNav === 'Deal Pipeline' ? (
            <DealPipeline isDark={isDark} />
          ) : activeNav === 'Opportunity Intake' ? (
            <OpportunityIntake isDark={isDark} />
          ) : activeNav === 'Documents' ? (
            <Documents isDark={isDark} />
          ) : activeNav === 'Capital Desk' ? (
            <CapitalDesk isDark={isDark} />
          ) : activeNav === 'Participation' ? (
            <Participation isDark={isDark} />
          ) : activeNav === 'Notifications' ? (
            <Notifications isDark={isDark} />
          ) : (
            <Dashboard isDark={isDark} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
