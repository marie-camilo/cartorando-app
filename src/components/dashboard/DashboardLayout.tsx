import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row mt-[100px]">

      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <Sidebar
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed top-0 left-0 h-screen z-50 w-72 bg-white shadow-md p-6 transform transition-transform
          md:relative md:translate-x-0 md:h-screen md:z-30
        `}
      />

      {/* Contenu principal */}
      <main className="flex-1 p-6 bg-gray-50 rounded-xl md:ml-0">
        {/* Mobile toggle button */}
        <button
          className="md:hidden mb-4 px-3 py-2 bg-[var(--orange)] text-white rounded-lg"
          onClick={() => setSidebarOpen(true)}
        >
          Menu
        </button>

        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
