// src/components/Sidebar.jsx

import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  CalendarCheck,
  LogOut,
  X,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Enquiries",
    path: "/enquiries",
    icon: ClipboardList,
  },
  {
    name: "Properties",
    path: "/properties",
    icon: Building2,
  },
  {
    name: "Clients",
    path: "/clients",
    icon: Users,
  },
  {
    name: "Follow-ups",
    path: "/followups",
    icon: CalendarCheck,
  },
];

export default function Sidebar({
  mobileOpen,
  closeMobileMenu,
}) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <aside
      className={`sidebar ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >

      <div className="brand">

        <div className="brand-logo">
          S
        </div>

        <div>
          <h2>Swastik</h2>
          <span>Properties ERP</span>
        </div>

        {/* Mobile close button */}
        <button
          className="sidebar-close-button"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <X size={19} />
        </button>

      </div>

      <nav className="sidebar-menu">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Sign Out
      </button>

    </aside>
  );
}