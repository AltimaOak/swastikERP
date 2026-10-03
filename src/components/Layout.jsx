import { useState } from "react";
import { Menu, User } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      {sidebarOpen && (
        <div className="backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        mobileOpen={sidebarOpen}
        closeMobileMenu={() => setSidebarOpen(false)}
      />

      <div className="main-wrapper">
        <header className="navbar">
          <div className="navbar-left">
            <button
              className="btn-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <span className="navbar-brand-name">Swastik Properties ERP</span>
          </div>

          <div className="navbar-right">
            <div className="user-pill">
              <User size={15} />
              <span>Admin</span>
            </div>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}