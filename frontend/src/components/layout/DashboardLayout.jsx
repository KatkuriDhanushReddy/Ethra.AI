import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';

export default function DashboardLayout() {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main
        className={`min-h-screen p-4 pt-16 transition-all lg:p-8 lg:pt-8 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
