// src/components/Layout.jsx

import { useState } from "react";
import { Bell, CircleUserRound, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="erp-layout">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={sidebarOpen}
        closeMobileMenu={() => setSidebarOpen(false)}
      />

      <div className="main-area">

        <header className="topbar">

          <div className="topbar-left">

            {/* Mobile menu */}
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <h3>Swastik Properties</h3>
              <span>Property Management</span>
            </div>

          </div>

          <div className="topbar-right">

            <button className="icon-button">
              <Bell size={18} />
            </button>

            <div className="admin-profile">
              <CircleUserRound size={20} />

              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>
            </div>

          </div>

        </header>

        <main className="page-content">
          {children}
        </main>

      </div>
    </div>
  );
}